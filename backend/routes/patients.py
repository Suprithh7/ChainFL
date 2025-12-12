"""
Patient management and dashboard endpoints for ChainFL-Care.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

router = APIRouter()

# In-memory patient storage
patients_db = [
    {
        "id": 1,
        "name": "John Doe",
        "age": 68,
        "bp": 155,
        "cholesterol": 260,
        "glucose": 1,
        "maxHr": 135,
        "stDepression": 2.3,
        "troponin": 0.08,
        "ejectionFraction": 38,
        "creatinine": 1.6,
        "bmi": 31.2,
        "last_risk_score": 87.5,
        "risk_category": "Critical",
        "created_at": "2025-12-12T10:30:00"
    },
    {
        "id": 2,
        "name": "Jane Smith",
        "age": 55,
        "bp": 130,
        "cholesterol": 200,
        "glucose": 0,
        "maxHr": 160,
        "stDepression": 1.0,
        "troponin": 0.02,
        "ejectionFraction": 60,
        "creatinine": 1.0,
        "bmi": 24.0,
        "last_risk_score": 34.2,
        "risk_category": "Moderate",
        "created_at": "2025-12-12T09:15:00"
    },
    {
        "id": 3,
        "name": "Robert Johnson",
        "age": 72,
        "bp": 165,
        "cholesterol": 280,
        "glucose": 1,
        "maxHr": 125,
        "stDepression": 3.1,
        "troponin": 0.15,
        "ejectionFraction": 32,
        "creatinine": 2.1,
        "bmi": 29.5,
        "last_risk_score": 92.3,
        "risk_category": "Critical",
        "created_at": "2025-12-11T16:45:00"
    },
    {
        "id": 4,
        "name": "Mary Williams",
        "age": 45,
        "bp": 120,
        "cholesterol": 180,
        "glucose": 0,
        "maxHr": 170,
        "stDepression": 0.5,
        "troponin": 0.01,
        "ejectionFraction": 65,
        "creatinine": 0.9,
        "bmi": 22.5,
        "last_risk_score": 18.7,
        "risk_category": "Low",
        "created_at": "2025-12-12T08:00:00"
    },
    {
        "id": 5,
        "name": "James Brown",
        "age": 61,
        "bp": 145,
        "cholesterol": 235,
        "glucose": 1,
        "maxHr": 145,
        "stDepression": 1.8,
        "troponin": 0.05,
        "ejectionFraction": 48,
        "creatinine": 1.3,
        "bmi": 27.8,
        "last_risk_score": 65.4,
        "risk_category": "High",
        "created_at": "2025-12-12T07:30:00"
    }
]

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
    return patients_db


@router.get("/api/patients/{patient_id}")
async def get_patient(patient_id: int):
    """Get a specific patient by ID."""
    patient = next((p for p in patients_db if p["id"] == patient_id), None)
    if not patient:
        return {"error": "Patient not found"}
    return patient


@router.post("/api/patients")
async def create_patient(patient: PatientCreate):
    """Add a new patient."""
    new_id = max([p["id"] for p in patients_db]) + 1 if patients_db else 1
    new_patient = {
        "id": new_id,
        **patient.model_dump(),
        "last_risk_score": None,
        "risk_category": "Not Assessed",
        "created_at": datetime.now().isoformat()
    }
    patients_db.append(new_patient)
    return new_patient


@router.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get real-time dashboard statistics."""
    total_patients = len(patients_db)
    high_risk_count = len([p for p in patients_db if p.get("last_risk_score", 0) >= 60])
    
    # Calculate average risk from patients with scores
    patients_with_scores = [p for p in patients_db if p.get("last_risk_score") is not None]
    avg_risk = sum([p["last_risk_score"] for p in patients_with_scores]) / len(patients_with_scores) if patients_with_scores else 0
    
    # Get recent patient for display
    recent_patient = patients_db[0] if patients_db else None
    
    return {
        "total_patients": total_patients,
        "high_risk_count": high_risk_count,
        "average_risk": round(avg_risk, 1),
        "recent_patient": recent_patient,
        "last_updated": datetime.now().isoformat()
    }


@router.get("/api/forecast/{patient_id}")
async def get_risk_forecast(patient_id: int):
    """Generate 20-day risk forecast for a patient."""
    patient = next((p for p in patients_db if p["id"] == patient_id), None)
    if not patient:
        return {"error": "Patient not found"}
    
    base_risk = patient.get("last_risk_score", 50)
    
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
        "patient_name": patient["name"],
        "current_risk": base_risk,
        "forecast": forecast
    }
