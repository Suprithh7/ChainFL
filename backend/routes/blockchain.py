"""
Blockchain API routes for patient consent and node registry.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import sys
from pathlib import Path

# Add blockchain module to path
sys.path.append(str(Path(__file__).parent.parent))

from blockchain import blockchain_utils
from blockchain.web3_client import is_connected

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


class NodeResponse(BaseModel):
    success: bool
    message: str
    transaction_hash: str = ""


class NodeVerifyResponse(BaseModel):
    node_id: str
    is_verified: bool
    details: Dict[str, Any] = {}


# ============= CONSENT ENDPOINTS =============

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

@router.post("/node/register", response_model=NodeResponse)
async def register_node(request: NodeRegisterRequest):
    """Register a new hospital node."""
    if not is_connected():
        raise HTTPException(status_code=503, detail="Blockchain not connected")
    
    success, tx_hash = blockchain_utils.register_node(
        request.node_id,
        request.hospital_name,
        request.public_key
    )
    
    if success:
        return NodeResponse(
            success=True,
            message=f"Node {request.node_id} registered successfully",
            transaction_hash=tx_hash
        )
    else:
        raise HTTPException(status_code=500, detail=f"Failed to register node: {tx_hash}")


@router.get("/node/verify/{node_id}", response_model=NodeVerifyResponse)
async def verify_node(node_id: str):
    """Verify if a node is registered and verified."""
    if not is_connected():
        raise HTTPException(status_code=503, detail="Blockchain not connected")
    
    is_verified = blockchain_utils.verify_node(node_id)
    details = blockchain_utils.get_node_details(node_id) if is_verified else {}
    
    return NodeVerifyResponse(
        node_id=node_id,
        is_verified=is_verified,
        details=details
    )


@router.get("/nodes", response_model=List[Dict[str, Any]])
async def get_all_nodes():
    """Get all registered nodes."""
    if not is_connected():
        raise HTTPException(status_code=503, detail="Blockchain not connected")
    
    node_ids = blockchain_utils.get_all_nodes()
    
    nodes = []
    for node_id in node_ids:
        details = blockchain_utils.get_node_details(node_id)
        if details:
            nodes.append({
                'node_id': node_id,
                **details
            })
    
    return nodes


@router.get("/status")
async def blockchain_status():
    """Get blockchain connection status."""
    connected = is_connected()
    
    return {
        "connected": connected,
        "message": "Blockchain connected" if connected else "Blockchain not connected",
        "rpc_url": "http://127.0.0.1:8545"
    }
