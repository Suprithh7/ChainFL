"""
In-memory patient storage for ChainFL-Care.
Stores patient records with prediction results.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class PatientRecord(BaseModel):
    """Patient record with prediction results."""
    id: str
    name: str
    age: int
    gender: Optional[str] = None
    contact: Optional[str] = None
    
    # Clinical parameters
    bp: float
    cholesterol: float
    glucose: int
    maxHr: float
    stDepression: float
    troponin: float
    ejectionFraction: float
    creatinine: float
    bmi: float
    
    # Optional multi-disease parameters
    hba1c: Optional[float] = None
    gfr: Optional[float] = None
    protein_urine: Optional[float] = None
    alt: Optional[float] = None
    ast: Optional[float] = None
    bilirubin: Optional[float] = None
    albumin: Optional[float] = None
    platelet_count: Optional[float] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    
    # Prediction results
    risk_score: float
    risk_category: str
    recommendation: str
    top_factors: List[Dict[str, Any]]
    multi_disease_risks: Optional[Dict[str, Any]] = None
    
    # Metadata
    timestamp: str
    doctor_notes: Optional[str] = None


# In-memory storage
patients_db: List[PatientRecord] = []


def add_patient(patient: PatientRecord) -> PatientRecord:
    """Add a new patient record."""
    patients_db.append(patient)
    return patient


def get_all_patients() -> List[PatientRecord]:
    """Get all patient records, sorted by most recent first."""
    return sorted(patients_db, key=lambda x: x.timestamp, reverse=True)


def get_patient_by_id(patient_id: str) -> Optional[PatientRecord]:
    """Get a specific patient by ID."""
    for patient in patients_db:
        if patient.id == patient_id:
            return patient
    return None


def update_patient(patient_id: str, updates: Dict[str, Any]) -> Optional[PatientRecord]:
    """Update a patient record."""
    for i, patient in enumerate(patients_db):
        if patient.id == patient_id:
            updated_data = patient.dict()
            updated_data.update(updates)
            patients_db[i] = PatientRecord(**updated_data)
            return patients_db[i]
    return None


def delete_patient(patient_id: str) -> bool:
    """Delete a patient record."""
    for i, patient in enumerate(patients_db):
        if patient.id == patient_id:
            patients_db.pop(i)
            return True
    return False


def get_patient_count() -> int:
    """Get total number of patients."""
    return len(patients_db)


def get_high_risk_patients() -> List[PatientRecord]:
    """Get patients with high or critical risk."""
    return [p for p in patients_db if p.risk_category in ['High', 'Critical']]
