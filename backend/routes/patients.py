"""
Patient management and dashboard endpoints for ChainFL-Care.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

# Import centralized patient storage
from data.patients_store import (
    patients_db,
    PatientRecord,
    add_patient,
    get_all_patients,
    get_patient_by_id
)

router = APIRouter()


class PatientCreate(BaseModel):
    name: str
    age: float
    bp: float
    cholesterol: float
    glucose: int
    maxHr: float
    stDepression: float
    troponin: float
    ejectionFraction: float
    creatinine: float
    bmi: float


@router.get("/api/patients")
async def get_patients():
    """Get all patients."""
    all_patients = get_all_patients()
    # Return in format expected by frontend: {patients: [...]}
    return {
        "patients": [p.dict() for p in all_patients],
        "total": len(all_patients),
        "high_risk_count": len([p for p in all_patients if p.risk_score >= 60])
    }


@router.get("/api/patients/{patient_id}")
async def get_patient(patient_id: str):
    """Get a specific patient by ID."""
    patient = get_patient_by_id(patient_id)
    if not patient:
        return {"error": "Patient not found"}
    return patient.dict()


@router.post("/api/patients")
async def create_patient(patient_data: Dict[str, Any]):
    """Add a new patient with prediction results."""
    import uuid
    
    # Generate unique ID if not provided
    if 'id' not in patient_data:
        patient_data['id'] = str(uuid.uuid4())[:8]
    
    # Create patient record from provided data
    new_patient = PatientRecord(**patient_data)
    add_patient(new_patient)
    
    return {
        "success": True,
        "patient_id": new_patient.id,
        "message": "Patient record saved successfully"
    }


@router.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get real-time dashboard statistics."""
    all_patients = get_all_patients()
    total_patients = len(all_patients)
    high_risk_count = len([p for p in all_patients if p.risk_score >= 60])
    
    # Calculate average risk from patients with scores
    avg_risk = sum([p.risk_score for p in all_patients]) / len(all_patients) if all_patients else 0
    
    # Get recent patient for display
    recent_patient = all_patients[0].dict() if all_patients else None
    
    return {
        "total_patients": total_patients,
        "high_risk_count": high_risk_count,
        "average_risk": round(avg_risk, 1),
        "recent_patient": recent_patient,
        "last_updated": datetime.now().isoformat()
    }


@router.get("/api/forecast/{patient_id}")
async def get_risk_forecast(patient_id: str):
    """Generate 20-day risk forecast for a patient."""
    patient = get_patient_by_id(patient_id)
    if not patient:
        return {"error": "Patient not found"}
    
    base_risk = patient.risk_score
    
    # Generate 20-day forecast with some variation
    forecast = []
    current_risk = base_risk
    
    for day in range(1, 21):
        # Add some realistic variation
        variation = random.uniform(-3, 2)  # Slight downward trend with treatment
        current_risk = max(10, min(99, current_risk + variation))
        
        forecast.append({
            "day": day,
            "risk_score": round(current_risk, 1),
            "date": (datetime.now() + timedelta(days=day)).strftime("%Y-%m-%d")
        })
    
    return {
        "patient_id": patient_id,
        "patient_name": patient.name,
        "current_risk": base_risk,
        "forecast": forecast
    }
