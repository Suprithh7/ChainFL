"""
FastAPI backend for ChainFL-Care cardiac risk prediction.
Provides endpoints for single and batch predictions with ML model.
"""
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
import pandas as pd
import io
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
from datetime import datetime, timedelta
import random

from utils.preprocessing import (
    validate_input, 
    calculate_risk_score, 
    get_recommendation,
    engineer_features
)
from models.risk_model import cardiac_model

# Initialize FastAPI app
app = FastAPI(
    title="ChainFL-Care Risk Prediction API",
    description="Industry-grade cardiac risk prediction with ML and explainability",
    version="2.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include patient routes
from routes import blockchain, patients
app.include_router(patients.router)
app.include_router(blockchain.router, prefix="/blockchain", tags=["blockchain"])



# Pydantic models for request/response validation
class PatientData(BaseModel):
    """Patient clinical data for risk prediction."""
    age: float = Field(..., ge=0, le=120, description="Age in years")
    bp: float = Field(..., ge=60, le=250, description="Resting blood pressure (mmHg)")
    cholesterol: float = Field(..., ge=100, le=600, description="Cholesterol (mg/dL)")
    glucose: int = Field(..., ge=0, le=1, description="Fasting blood sugar > 120 (0=no, 1=yes)")
    maxHr: float = Field(..., ge=40, le=220, description="Maximum heart rate")
    stDepression: float = Field(..., ge=0, le=10, description="ST depression induced by exercise")
    troponin: float = Field(..., ge=0, le=50, description="Troponin level (ng/mL)")
    ejectionFraction: float = Field(..., ge=10, le=80, description="Ejection fraction (%)")
    creatinine: float = Field(..., ge=0.3, le=15, description="Serum creatinine (mg/dL)")
    bmi: float = Field(..., ge=10, le=60, description="Body Mass Index")
    
    # Additional parameters for multi-disease prediction (optional)
    hba1c: Optional[float] = Field(None, ge=4.0, le=14.0, description="Hemoglobin A1c (%)")
    gfr: Optional[float] = Field(None, ge=5, le=150, description="Glomerular filtration rate")
    protein_urine: Optional[float] = Field(None, ge=0, le=1000, description="Protein in urine (mg/dL)")
    alt: Optional[float] = Field(None, ge=0, le=500, description="ALT (U/L)")
    ast: Optional[float] = Field(None, ge=0, le=500, description="AST (U/L)")
    bilirubin: Optional[float] = Field(None, ge=0, le=20, description="Bilirubin (mg/dL)")
    albumin: Optional[float] = Field(None, ge=2.0, le=5.5, description="Albumin (g/dL)")
    platelet_count: Optional[float] = Field(None, ge=50, le=450, description="Platelets (×10³/μL)")
    systolic_bp: Optional[int] = Field(None, ge=80, le=220, description="Systolic BP (mmHg)")
    diastolic_bp: Optional[int] = Field(None, ge=40, le=140, description="Diastolic BP (mmHg)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "age": 65,
                "bp": 145,
                "cholesterol": 240,
                "glucose": 1,
                "maxHr": 140,
                "stDepression": 2.0,
                "troponin": 0.08,
                "ejectionFraction": 42,
                "creatinine": 1.4,
                "bmi": 28.5
            }
        }


class PredictionResponse(BaseModel):
    """Response model for risk prediction."""
    risk_score: float
    risk_category: str
    recommendation: str
    top_factors: List[Dict[str, Any]]
    forecast: List[Dict[str, Any]] = []
    multi_disease_risks: Optional[Dict[str, Any]] = None  # NEW: Multi-disease predictions
    shap_values: Optional[Dict[str, Any]] = None
    timestamp: str


class BatchPredictionResponse(BaseModel):
    """Response model for batch predictions."""
    total_patients: int
    predictions: List[Dict[str, Any]]
    summary: Dict[str, Any]
    timestamp: str


class ModelInfo(BaseModel):
    """Model metadata response."""
    algorithm_type: str
    version: str
    features: List[str]
    is_trained: bool
    description: str
    
    class Config:
        protected_namespaces = ()


# In-memory storage for logs (replace with database in production)
prediction_logs = []


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "ChainFL-Care Risk Prediction API",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": {
            "predict": "/api/predict",
            "batch_predict": "/api/predict/batch",
            "model_info": "/api/model/info",
            "health": "/api/health"
        }
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": cardiac_model.is_trained
    }


@app.get("/api/model/info", response_model=ModelInfo)
async def get_model_info():
    """Get model information and metadata."""
    return ModelInfo(
        algorithm_type="Logistic Regression with Feature Engineering",
        version="2.0.0",
        features=cardiac_model.feature_names,
        is_trained=cardiac_model.is_trained,
        description="Industry-grade cardiac risk prediction model with SHAP explainability"
    )


@app.post("/api/predict", response_model=PredictionResponse)
async def predict_risk(patient: PatientData):
    """
    Predict cardiac risk for a single patient.
    
    Args:
        patient: Patient clinical data
        
    Returns:
        Risk prediction with score, category, and recommendations
    """
    try:
        # Convert to dict for validation
        patient_dict = patient.model_dump()
        
        # Validate input ranges
        is_valid, error_msg = validate_input(patient_dict)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Calculate cardiac risk score using clinical algorithm
        result = calculate_risk_score(patient_dict)
        
        # ALWAYS calculate multi-disease risks (use defaults for missing values)
        multi_disease_risks = {}
        try:
            from utils.multi_disease import (
                calculate_diabetes_risk,
                calculate_kidney_risk,
                calculate_liver_risk,
                calculate_hypertension_risk
            )
            
            # Diabetes risk (always calculate)
            diabetes_data = {
                'glucose': patient_dict.get('glucose', 0) * 120,  # Convert 0/1 to mg/dL
                'hba1c': patient_dict.get('hba1c', 5.5),  # Default: normal
                'bmi': patient_dict.get('bmi'),
                'age': patient_dict.get('age'),
                'bp': patient_dict.get('bp')
            }
            multi_disease_risks['diabetes'] = calculate_diabetes_risk(diabetes_data)
            
            # Kidney risk (always calculate)
            kidney_data = {
                'creatinine': patient_dict.get('creatinine'),
                'gfr': patient_dict.get('gfr', 100),  # Default: normal
                'protein_urine': patient_dict.get('protein_urine', 15),  # Default: normal
                'bp': patient_dict.get('bp'),
                'age': patient_dict.get('age')
            }
            multi_disease_risks['kidney'] = calculate_kidney_risk(kidney_data)
            
            # Liver risk (always calculate)
            liver_data = {
                'alt': patient_dict.get('alt', 30),  # Default: normal
                'ast': patient_dict.get('ast', 25),  # Default: normal
                'bilirubin': patient_dict.get('bilirubin', 0.8),  # Default: normal
                'albumin': patient_dict.get('albumin', 4.0),  # Default: normal
                'platelet_count': patient_dict.get('platelet_count', 250)  # Default: normal
            }
            multi_disease_risks['liver'] = calculate_liver_risk(liver_data)
            
            # Hypertension risk (always calculate)
            hypertension_data = {
                'systolic_bp': patient_dict.get('systolic_bp', patient_dict.get('bp')),
                'diastolic_bp': patient_dict.get('diastolic_bp', int(patient_dict.get('bp', 120) * 0.67)),  # Estimate
                'age': patient_dict.get('age'),
                'bmi': patient_dict.get('bmi'),
                'bp': patient_dict.get('bp')
            }
            multi_disease_risks['hypertension'] = calculate_hypertension_risk(hypertension_data)
                
        except Exception as e:
            # Write error to file for debugging
            with open('multi_disease_error.log', 'w') as f:
                import traceback
                f.write(f"Error: {str(e)}\n\n")
                f.write(traceback.format_exc())
            logger.error(f"Multi-disease calculation failed: {e}", exc_info=True)
            multi_disease_risks = None
        
        # Force reload\n        logger.info(f"Multi-disease risks calculated: {multi_disease_risks is not None}")
        if multi_disease_risks:
            logger.info(f"Diseases calculated: {list(multi_disease_risks.keys())}")
        # Get SHAP values for explainability
        df = pd.DataFrame([patient_dict])
        shap_result = cardiac_model.calculate_shap_values(df)
        
        # Generate recommendation
        recommendation = get_recommendation(result['risk_score'], result['top_factors'])
        
        # Generate 20-day forecast
        forecast = []
        current_risk = result['risk_score']
        for day in range(1, 21):
            # Add realistic variation (slight improvement with treatment)
            variation = random.uniform(-2.5, 1.5)
            current_risk = max(10, min(99, current_risk + variation))
            forecast.append({
                "day": day,
                "risk_score": round(current_risk, 1),
                "date": (datetime.now() + timedelta(days=day)).strftime("%Y-%m-%d")
            })
        
        # Log prediction
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "risk_score": result['risk_score'],
            "category": result['risk_category']
        }
        prediction_logs.append(log_entry)
        
        
        return PredictionResponse(
            risk_score=result['risk_score'],
            risk_category=result['risk_category'],
            recommendation=recommendation,
            top_factors=result['top_factors'],
            forecast=forecast,
            multi_disease_risks=multi_disease_risks,
            shap_values=shap_result,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/api/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(file: UploadFile = File(...)):
    """
    Batch prediction from CSV file.
    
    Args:
        file: CSV file with patient data
        
    Returns:
        Batch prediction results with summary statistics
    """
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        # Read CSV
        contents = await file.read()
        
        # Check file size (5MB limit)
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
        
        # Parse CSV
        try:
            df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")
        
        # Validate required columns
        required_columns = [
            'age', 'bp', 'cholesterol', 'glucose', 'maxHr', 'stDepression',
            'troponin', 'ejectionFraction', 'creatinine', 'bmi'
        ]
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Process each patient
        predictions = []
        risk_scores = []
        
        for idx, row in df.iterrows():
            try:
                patient_dict = row.to_dict()
                
                # Validate input
                is_valid, error_msg = validate_input(patient_dict)
                if not is_valid:
                    predictions.append({
                        "patient_id": idx + 1,
                        "error": error_msg,
                        "risk_score": None,
                        "risk_category": "Error"
                    })
                    continue
                
                # Calculate risk
                result = calculate_risk_score(patient_dict)
                risk_scores.append(result['risk_score'])
                
                predictions.append({
                    "patient_id": idx + 1,
                    "risk_score": result['risk_score'],
                    "risk_category": result['risk_category'],
                    "top_factor": result['top_factors'][0]['name'] if result['top_factors'] else "N/A",
                    "age": patient_dict['age'],
                    "troponin": patient_dict['troponin'],
                    "ejectionFraction": patient_dict['ejectionFraction']
                })
                
            except Exception as e:
                predictions.append({
                    "patient_id": idx + 1,
                    "error": str(e),
                    "risk_score": None,
                    "risk_category": "Error"
                })
        
        # Calculate summary statistics
        valid_scores = [p['risk_score'] for p in predictions if p['risk_score'] is not None]
        
        summary = {
            "total_patients": len(predictions),
            "successful_predictions": len(valid_scores),
            "failed_predictions": len(predictions) - len(valid_scores),
            "average_risk": round(sum(valid_scores) / len(valid_scores), 1) if valid_scores else 0,
            "high_risk_count": sum(1 for s in valid_scores if s >= 60),
            "moderate_risk_count": sum(1 for s in valid_scores if 30 <= s < 60),
            "low_risk_count": sum(1 for s in valid_scores if s < 30),
            "max_risk": max(valid_scores) if valid_scores else 0,
            "min_risk": min(valid_scores) if valid_scores else 0
        }
        
        return BatchPredictionResponse(
            total_patients=len(predictions),
            predictions=predictions,
            summary=summary,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")


@app.get("/api/logs")
async def get_logs():
    """Get recent prediction logs."""
    return {"logs": prediction_logs[-10:]}  # Return last 10 logs

