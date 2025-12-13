"""
Feature engineering and preprocessing utilities for cardiac risk prediction.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any


def validate_input(data: Dict[str, Any]) -> tuple[bool, str]:
    """
    Validate input data ranges for clinical parameters.
    
    Returns:
        (is_valid, error_message)
    """
    validations = {
        'age': (0, 120, 'Age must be between 0-120 years'),
        'bp': (60, 250, 'Blood pressure must be between 60-250 mmHg'),
        'cholesterol': (100, 600, 'Cholesterol must be between 100-600 mg/dL'),
        'glucose': (0, 400, 'Glucose must be between 0-400 mg/dL'),
        'maxHr': (40, 220, 'Max heart rate must be between 40-220 bpm'),
        'stDepression': (0, 10, 'ST Depression must be between 0-10'),
        'troponin': (0, 50, 'Troponin must be between 0-50 ng/mL'),
        'ejectionFraction': (10, 80, 'Ejection Fraction must be between 10-80%'),
        'creatinine': (0.3, 15, 'Creatinine must be between 0.3-15 mg/dL'),
        'bmi': (10, 60, 'BMI must be between 10-60')
    }
    
    for field, (min_val, max_val, error_msg) in validations.items():
        if field not in data:
            return False, f"Missing required field: {field}"
        
        try:
            value = float(data[field])
            if not (min_val <= value <= max_val):
                return False, error_msg
        except (ValueError, TypeError):
            return False, f"Invalid value for {field}: must be a number"
    
    return True, ""


def engineer_features(data: pd.DataFrame) -> pd.DataFrame:
    """
    Create engineered features from raw clinical data.
    
    Args:
        data: DataFrame with raw clinical features
        
    Returns:
        DataFrame with additional engineered features
    """
    df = data.copy()
    
    # Age risk stratification
    df['age_risk'] = (df['age'] > 60).astype(int)
    df['age_critical'] = (df['age'] > 75).astype(int)
    
    # Troponin elevation flags (clinical thresholds)
    df['troponin_elevated'] = (df['troponin'] > 0.04).astype(int)
    df['troponin_critical'] = (df['troponin'] > 0.5).astype(int)
    
    # Ejection Fraction categories
    df['ef_reduced'] = (df['ejectionFraction'] < 40).astype(int)
    df['ef_severely_reduced'] = (df['ejectionFraction'] < 30).astype(int)
    
    # Renal dysfunction (elevated creatinine)
    df['renal_dysfunction'] = (df['creatinine'] > 1.3).astype(int)
    df['renal_severe'] = (df['creatinine'] > 2.0).astype(int)
    
    # BMI categories
    df['overweight'] = ((df['bmi'] >= 25) & (df['bmi'] < 30)).astype(int)
    df['obese'] = (df['bmi'] >= 30).astype(int)
    
    # Blood pressure categories
    df['hypertension'] = (df['bp'] > 140).astype(int)
    df['severe_hypertension'] = (df['bp'] > 180).astype(int)
    
    # Cholesterol risk
    df['high_cholesterol'] = (df['cholesterol'] > 240).astype(int)
    
    # ST Depression severity
    df['st_depression_significant'] = (df['stDepression'] > 1.5).astype(int)
    
    # Heart rate abnormalities
    df['low_max_hr'] = (df['maxHr'] < 100).astype(int)
    
    # Interaction terms (clinically meaningful combinations)
    df['age_troponin'] = df['age'] * df['troponin']
    df['ef_creatinine'] = df['ejectionFraction'] * df['creatinine']
    df['age_ef'] = df['age'] * (100 - df['ejectionFraction'])  # Higher = worse
    df['troponin_st'] = df['troponin'] * df['stDepression']
    
    # Composite risk scores
    df['biomarker_score'] = (
        df['troponin_elevated'] * 3 +
        df['ef_reduced'] * 2 +
        df['renal_dysfunction'] * 2 +
        df['high_cholesterol']
    )
    
    df['vital_score'] = (
        df['hypertension'] * 2 +
        df['st_depression_significant'] * 3 +
        df['low_max_hr']
    )
    
    return df


def calculate_risk_score(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate cardiac risk score using clinical algorithm.
    This is a simplified model for demonstration.
    
    Args:
        data: Dictionary with patient clinical parameters
        
    Returns:
        Dictionary with risk score and contributing factors
    """
    # Base risk
    risk = 10.0
    factors = []
    
    # Age contribution (0-25 points)
    age = float(data['age'])
    age_points = min(25, (age - 30) * 0.5) if age > 30 else 0
    risk += age_points
    if age_points > 15:
        factors.append({'name': 'Age', 'points': age_points, 'severity': 'High'})
    
    # Troponin (0-30 points) - strongest predictor
    troponin = float(data['troponin'])
    if troponin > 0.04:
        troponin_points = min(30, 15 + (troponin - 0.04) * 100)
        risk += troponin_points
        factors.append({'name': 'Troponin', 'points': troponin_points, 'severity': 'Critical' if troponin > 0.5 else 'High'})
    
    # Ejection Fraction (0-25 points)
    ef = float(data['ejectionFraction'])
    if ef < 55:
        ef_points = min(25, (55 - ef) * 0.8)
        risk += ef_points
        if ef_points > 12:
            factors.append({'name': 'Ejection Fraction', 'points': ef_points, 'severity': 'Critical' if ef < 30 else 'High'})
    
    # ST Depression (0-20 points)
    st_dep = float(data['stDepression'])
    st_points = min(20, st_dep * 8)
    risk += st_points
    if st_points > 10:
        factors.append({'name': 'ST Depression', 'points': st_points, 'severity': 'High'})
    
    # Blood Pressure (0-10 points)
    bp = float(data['bp'])
    if bp > 140:
        bp_points = min(10, (bp - 140) * 0.15)
        risk += bp_points
    
    # Creatinine (0-15 points)
    creatinine = float(data['creatinine'])
    if creatinine > 1.3:
        creat_points = min(15, (creatinine - 1.3) * 8)
        risk += creat_points
        if creat_points > 8:
            factors.append({'name': 'Creatinine', 'points': creat_points, 'severity': 'High'})
    
    # BMI (0-8 points)
    bmi = float(data['bmi'])
    if bmi >= 30:
        bmi_points = min(8, (bmi - 30) * 0.4)
        risk += bmi_points
    
    # Cholesterol (0-8 points)
    cholesterol = float(data['cholesterol'])
    if cholesterol > 240:
        chol_points = min(8, (cholesterol - 240) * 0.03)
        risk += chol_points
    
    # Max HR (protective factor, can reduce risk)
    max_hr = float(data['maxHr'])
    if max_hr < 100:
        risk += (100 - max_hr) * 0.1
    
    # Glucose (0-10 points)
    glucose = float(data['glucose'])
    if glucose > 120:
        glucose_points = min(10, (glucose - 120) * 0.05)
        risk += glucose_points
    
    # Cap risk at 99%
    risk = min(99, max(1, risk))
    
    # Sort factors by contribution
    factors.sort(key=lambda x: x['points'], reverse=True)
    
    return {
        'risk_score': round(risk, 1),
        'top_factors': factors[:3],
        'risk_category': get_risk_category(risk)
    }


def get_risk_category(risk_score: float) -> str:
    """Get risk category based on score."""
    if risk_score < 30:
        return 'Low'
    elif risk_score < 60:
        return 'Moderate'
    elif risk_score < 85:
        return 'High'
    else:
        return 'Critical'


def get_recommendation(risk_score: float, top_factors: list) -> str:
    """Generate clinical recommendation based on risk score."""
    if risk_score >= 85:
        return "URGENT: Immediate cardiology consultation required. Consider emergency admission and comprehensive cardiac workup including angiography."
    elif risk_score >= 60:
        return "HIGH RISK: Schedule urgent cardiology appointment within 24-48 hours. Recommend stress test and echocardiogram."
    elif risk_score >= 30:
        return "MODERATE RISK: Cardiology follow-up recommended within 1-2 weeks. Lifestyle modifications and medication review advised."
    else:
        return "LOW RISK: Routine monitoring suggested. Continue current management and follow-up in 3-6 months."
