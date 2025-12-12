"""
Blockchain API routes for patient consent and node registry.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import sys
from pathlib import Path

# Add blockchain module to path
sys.path.append(str(Path(__file__).parent.parent))

from blockchain import blockchain_utils
from blockchain.web3_client import is_connected
from utils.otp_service import send_email_otp, verify_otp, get_otp_status
from data.patients_store import get_patient_by_id
from data.legitimate_hospitals import (
    verify_hospital, 
    get_hospitals_by_location,
    STATES,
    DISTRICTS_BY_STATE
)

router = APIRouter()


# ============= REQUEST/RESPONSE MODELS =============

class ConsentRequest(BaseModel):
    patient_id: str
    hospital_id: str


class ConsentResponse(BaseModel):
    success: bool
    message: str
    transaction_hash: str = ""
    has_consent: bool = False


class NodeRegisterRequest(BaseModel):
    node_id: str
    hospital_name: str
    public_key: str
    state: Optional[str] = None
    district: Optional[str] = None


class NodeResponse(BaseModel):
    success: bool
    message: str
    transaction_hash: str = ""
    verification_status: Optional[str] = None  # "verified" or "flagged"


class NodeVerifyResponse(BaseModel):
    node_id: str
    is_verified: bool
    details: Dict[str, Any] = {}


class OTPRequest(BaseModel):
    patient_id: str
    hospital_id: str


class OTPVerifyRequest(BaseModel):
    patient_id: str
    hospital_id: str
    otp: str


class OTPResponse(BaseModel):
    success: bool
    message: str
    email: Optional[str] = None
    otp_for_demo: Optional[str] = None  # Only for demo/testing


# ============= CONSENT ENDPOINTS (WITH OTP) =============

@router.post("/consent/request-otp")
async def request_consent_otp(request: OTPRequest):
    """
    Request OTP for patient consent verification.
    Sends OTP to patient's email address.
    """
    # Get patient details
    patient = get_patient_by_id(request.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {request.patient_id} not found")
    
    # Check if patient has email
    if not hasattr(patient, 'contact') or not patient.contact or '@' not in patient.contact:
        raise HTTPException(
            status_code=400, 
            detail="Patient email not found. Please update patient record with email address."
        )
    
    patient_email = patient.contact
    patient_name = patient.name
    
    # Send OTP via email
    success, message, otp_demo = send_email_otp(patient_email, patient_name)
    
    if success:
        return OTPResponse(
            success=True,
            message=f"OTP sent to {patient_email}",
            email=patient_email,
            otp_for_demo=otp_demo  # Include OTP in response for demo (remove in production)
        )
    else:
        raise HTTPException(status_code=500, detail=message)


@router.post("/consent/verify-and-grant", response_model=ConsentResponse)
async def verify_otp_and_grant_consent(request: OTPVerifyRequest):
    """
    Verify OTP and grant consent if OTP is valid.
    This ensures only the patient can authorize data access.
    """
    if not is_connected():
        raise HTTPException(status_code=503, detail="Blockchain not connected")
    
    # Get patient details
    patient = get_patient_by_id(request.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {request.patient_id} not found")
    
    patient_email = patient.contact
    
    # Verify OTP
    otp_valid, otp_message = verify_otp(patient_email, request.otp)
    
    if not otp_valid:
        raise HTTPException(status_code=401, detail=otp_message)
    
    # OTP is valid - grant consent on blockchain
    success, tx_hash = blockchain_utils.grant_consent(
        request.patient_id,
        request.hospital_id
    )
    
    if success:
        return ConsentResponse(
            success=True,
            message=f"✅ OTP verified. Consent granted for patient {request.patient_id} to hospital {request.hospital_id}",
            transaction_hash=tx_hash,
            has_consent=True
        )
    else:
        raise HTTPException(status_code=500, detail=f"OTP verified but blockchain transaction failed: {tx_hash}")


@router.get("/consent/otp-status/{patient_id}")
async def get_otp_status_endpoint(patient_id: str):
    """Get OTP status for a patient (for debugging/admin)."""
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
    
    patient_email = patient.contact
    status = get_otp_status(patient_email)
    
    if status:
        return status
    else:
        return {"message": "No active OTP for this patient"}



@router.post("/consent/grant", response_model=ConsentResponse)
async def grant_consent(request: ConsentRequest):
    """Grant patient consent for hospital to use data."""
    if not is_connected():
        raise HTTPException(status_code=503, detail="Blockchain not connected")
    
    success, tx_hash = blockchain_utils.grant_consent(
        request.patient_id,
        request.hospital_id
    )
    
    if success:
        return ConsentResponse(
            success=True,
            message=f"Consent granted for patient {request.patient_id} to hospital {request.hospital_id}",
            transaction_hash=tx_hash,
            has_consent=True
        )
    else:
        raise HTTPException(status_code=500, detail=f"Failed to grant consent: {tx_hash}")


@router.post("/consent/revoke", response_model=ConsentResponse)
async def revoke_consent(request: ConsentRequest):
    """Revoke patient consent for hospital."""
    if not is_connected():
        raise HTTPException(status_code=503, detail="Blockchain not connected")
    
    success, tx_hash = blockchain_utils.revoke_consent(
        request.patient_id,
        request.hospital_id
    )
    
    if success:
        return ConsentResponse(
            success=True,
            message=f"Consent revoked for patient {request.patient_id} from hospital {request.hospital_id}",
            transaction_hash=tx_hash,
            has_consent=False
        )
    else:
        raise HTTPException(status_code=500, detail=f"Failed to revoke consent: {tx_hash}")


@router.get("/consent/check/{patient_id}/{hospital_id}", response_model=ConsentResponse)
async def check_consent(patient_id: str, hospital_id: str):
    """Check if patient has granted consent to hospital."""
    if not is_connected():
        raise HTTPException(status_code=503, detail="Blockchain not connected")
    
    has_consent = blockchain_utils.has_consent(patient_id, hospital_id)
    timestamp = blockchain_utils.get_consent_timestamp(patient_id, hospital_id)
    
    return ConsentResponse(
        success=True,
        message=f"Consent status retrieved",
        has_consent=has_consent,
        transaction_hash=f"Last updated: {timestamp}"
    )


# ============= NODE REGISTRY ENDPOINTS =============

# In-memory storage for flagged hospitals (use database in production)
flagged_hospitals = []
approved_hospitals = []


@router.post("/node/register", response_model=NodeResponse)
async def register_node(request: NodeRegisterRequest):
    """Register a new hospital node with verification."""
    if not is_connected():
        raise HTTPException(status_code=503, detail="Blockchain not connected")
    
    # Verify hospital against legitimate database
    verification_result = verify_hospital(
        request.hospital_name,
        request.state,
        request.district
    )
    
    # Register on blockchain
    success, tx_hash = blockchain_utils.register_node(
        request.node_id,
        request.hospital_name,
        request.public_key
    )
    
    if not success:
        raise HTTPException(status_code=500, detail=f"Failed to register node: {tx_hash}")
    
    # Handle verification status
    if verification_result["verified"]:
        # Verified hospital - add to approved list
        approved_hospitals.append({
            "node_id": request.node_id,
            "hospital_name": request.hospital_name,
            "state": request.state,
            "district": request.district,
            "public_key": request.public_key,
            "status": "verified",
            "transaction_hash": tx_hash,
            "hospital_details": verification_result["hospital"]
        })
        
        return NodeResponse(
            success=True,
            message=f"✅ {verification_result['message']}. Node registered successfully.",
            transaction_hash=tx_hash,
            verification_status="verified"
        )
    else:
        # Unverified hospital - add to flagged list
        flagged_hospitals.append({
            "node_id": request.node_id,
            "hospital_name": request.hospital_name,
            "state": request.state,
            "district": request.district,
            "public_key": request.public_key,
            "status": "flagged",
            "transaction_hash": tx_hash,
            "flagged_reason": verification_result["message"]
        })
        
        return NodeResponse(
            success=True,
            message=f"⚠️ {verification_result['message']}. Node registered but requires admin approval.",
            transaction_hash=tx_hash,
            verification_status="flagged"
        )


@router.get("/node/verify/{node_id}", response_model=NodeVerifyResponse)
async def verify_node(node_id: str):
    """Verify if a node is registered and verified."""
    if not is_connected():
        raise HTTPException(status_code=503, detail="Blockchain not connected")
    
    is_verified = blockchain_utils.verify_node(node_id)
    details = blockchain_utils.get_node_details(node_id) if is_verified else {}
    
    # Check if flagged or approved
    flagged = next((h for h in flagged_hospitals if h["node_id"] == node_id), None)
    approved = next((h for h in approved_hospitals if h["node_id"] == node_id), None)
    
    if approved:
        details["verification_status"] = "verified"
        details["hospital_details"] = approved.get("hospital_details", {})
    elif flagged:
        details["verification_status"] = "flagged"
        details["flagged_reason"] = flagged.get("flagged_reason", "")
    
    return NodeVerifyResponse(
        node_id=node_id,
        is_verified=is_verified,
        details=details
    )


@router.get("/nodes", response_model=List[Dict[str, Any]])
async def get_all_nodes():
    """Get all registered nodes with verification status."""
    if not is_connected():
        raise HTTPException(status_code=503, detail="Blockchain not connected")
    
    node_ids = blockchain_utils.get_all_nodes()
    
    nodes = []
    for node_id in node_ids:
        details = blockchain_utils.get_node_details(node_id)
        if details:
            # Add verification status
            flagged = next((h for h in flagged_hospitals if h["node_id"] == node_id), None)
            approved = next((h for h in approved_hospitals if h["node_id"] == node_id), None)
            
            if approved:
                details["verification_status"] = "verified"
                details["state"] = approved.get("state")
                details["district"] = approved.get("district")
            elif flagged:
                details["verification_status"] = "flagged"
                details["state"] = flagged.get("state")
                details["district"] = flagged.get("district")
            
            nodes.append({
                'node_id': node_id,
                **details
            })
    
    return nodes


# ============= HOSPITAL VERIFICATION & ADMIN ENDPOINTS =============

@router.get("/hospitals/states")
async def get_states():
    """Get list of states with legitimate hospitals."""
    return {"states": STATES}


@router.get("/hospitals/districts/{state}")
async def get_districts(state: str):
    """Get list of districts for a given state."""
    if state not in DISTRICTS_BY_STATE:
        raise HTTPException(status_code=404, detail=f"State '{state}' not found")
    return {"state": state, "districts": DISTRICTS_BY_STATE[state]}


@router.get("/hospitals/legitimate")
async def get_legitimate_hospitals(state: str = None, district: str = None):
    """Get list of legitimate hospitals, optionally filtered by location."""
    hospitals = get_hospitals_by_location(state, district)
    return {"hospitals": hospitals, "count": len(hospitals)}


@router.get("/hospitals/flagged")
async def get_flagged_hospitals():
    """Get list of flagged hospitals awaiting admin approval."""
    return {
        "flagged_hospitals": flagged_hospitals,
        "count": len(flagged_hospitals)
    }


@router.post("/hospitals/approve/{node_id}")
async def approve_hospital(node_id: str):
    """Admin endpoint to approve a flagged hospital."""
    # Find flagged hospital
    flagged = next((h for h in flagged_hospitals if h["node_id"] == node_id), None)
    
    if not flagged:
        raise HTTPException(status_code=404, detail=f"Flagged hospital with node_id '{node_id}' not found")
    
    # Move from flagged to approved
    flagged["status"] = "verified"
    approved_hospitals.append(flagged)
    flagged_hospitals.remove(flagged)
    
    return {
        "success": True,
        "message": f"Hospital '{flagged['hospital_name']}' approved successfully",
        "hospital": flagged
    }


@router.delete("/hospitals/reject/{node_id}")
async def reject_hospital(node_id: str):
    """Admin endpoint to reject a flagged hospital."""
    # Find flagged hospital
    flagged = next((h for h in flagged_hospitals if h["node_id"] == node_id), None)
    
    if not flagged:
        raise HTTPException(status_code=404, detail=f"Flagged hospital with node_id '{node_id}' not found")
    
    # Remove from flagged list
    flagged_hospitals.remove(flagged)
    
    return {
        "success": True,
        "message": f"Hospital '{flagged['hospital_name']}' rejected and removed",
        "hospital": flagged
    }


@router.get("/status")
async def blockchain_status():
    """Get blockchain connection status."""
    connected = is_connected()
    
    return {
        "connected": connected,
        "message": "Blockchain connected" if connected else "Blockchain not connected",
        "rpc_url": "http://127.0.0.1:8545"
    }


# ============= FEDERATED LEARNING SIMULATION ENDPOINTS =============

from services.fl_simulation_service import fl_service

class FLStartRoundRequest(BaseModel):
    hospital_ids: List[str]


@router.get("/fl/verified-hospitals")
async def get_verified_hospitals_for_fl():
    """Get list of verified hospitals available for FL training."""
    if not is_connected():
        raise HTTPException(status_code=503, detail="Blockchain not connected")
    
    # Get all nodes
    node_ids = blockchain_utils.get_all_nodes()
    
    verified_hospitals = []
    for node_id in node_ids:
        details = blockchain_utils.get_node_details(node_id)
        if details:
            # Check if verified
            approved = next((h for h in approved_hospitals if h["node_id"] == node_id), None)
            if approved and approved.get("status") == "verified":
                verified_hospitals.append({
                    'node_id': node_id,
                    'hospital_name': approved.get('hospital_name'),
                    'state': approved.get('state'),
                    'district': approved.get('district'),
                    'public_key': details.get('public_key'),
                    'registration_time': details.get('registration_time')
                })
    
    return {
        "verified_hospitals": verified_hospitals,
        "count": len(verified_hospitals)
    }


@router.post("/fl/start-round")
async def start_fl_training_round(request: FLStartRoundRequest):
    """Start a federated learning training round with selected hospitals."""
    if not request.hospital_ids or len(request.hospital_ids) == 0:
        raise HTTPException(status_code=400, detail="At least one hospital must be selected")
    
    # Get hospital details
    selected_hospitals = []
    for hospital_id in request.hospital_ids:
        approved = next((h for h in approved_hospitals if h["node_id"] == hospital_id), None)
        if approved:
            selected_hospitals.append(approved)
    
    if len(selected_hospitals) == 0:
        raise HTTPException(status_code=400, detail="No valid hospitals selected")
    
    # Run FL training round
    training_result = fl_service.run_training_round(selected_hospitals)
    
    return {
        "success": True,
        "message": f"FL Round #{training_result['round']} completed successfully",
        "result": training_result
    }


@router.get("/fl/metrics")
async def get_fl_metrics():
    """Get current FL model metrics."""
    metrics = fl_service.get_current_metrics()
    return metrics


@router.get("/fl/history")
async def get_fl_training_history():
    """Get complete FL training history."""
    history = fl_service.get_training_history()
    return {
        "history": history,
        "total_rounds": len(history)
    }


@router.post("/fl/reset")
async def reset_fl_simulation():
    """Reset FL simulation to initial state."""
    fl_service.reset_simulation()
    return {
        "success": True,
        "message": "FL simulation reset to initial state",
        "metrics": fl_service.get_current_metrics()
    }
