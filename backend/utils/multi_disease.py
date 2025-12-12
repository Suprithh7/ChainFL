"""
Multi-disease risk assessment utilities.
Provides clinical algorithms for predicting multiple diseases.
"""
import numpy as np
from typing import Dict, List, Tuple, Any


# ============= DIABETES RISK ASSESSMENT =============

def calculate_diabetes_risk(data: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculate diabetes risk based on clinical parameters.
    
    Parameters used:
    - glucose: Fasting blood glucose (mg/dL)
    - hba1c: Hemoglobin A1c (%)
    - bmi: Body Mass Index
    - age: Patient age
    - family_history: Family history of diabetes (0/1)
    - bp: Blood pressure
    """
    risk_score = 0
    factors = []
    
    # Glucose levels (0-40 points)
    glucose = data.get('glucose') or 0
    if glucose >= 126:
        risk_score += 40
        factors.append({'name': 'High Glucose', 'points': 40, 'severity': 'Critical'})
    elif glucose >= 100:
        risk_score += 25
        factors.append({'name': 'Elevated Glucose', 'points': 25, 'severity': 'High'})
    elif glucose >= 90:
        risk_score += 10
        factors.append({'name': 'Borderline Glucose', 'points': 10, 'severity': 'Moderate'})
    
    # HbA1c (0-30 points)
    hba1c = data.get('hba1c') or 0
    if hba1c >= 6.5:
        risk_score += 30
        factors.append({'name': 'High HbA1c', 'points': 30, 'severity': 'Critical'})
    elif hba1c >= 5.7:
        risk_score += 15
        factors.append({'name': 'Prediabetic HbA1c', 'points': 15, 'severity': 'High'})
    
    # BMI (0-20 points)
    bmi = data.get('bmi') or 0
    if bmi >= 30:
        risk_score += 20
        factors.append({'name': 'Obesity', 'points': 20, 'severity': 'High'})
    elif bmi >= 25:
        risk_score += 10
        factors.append({'name': 'Overweight', 'points': 10, 'severity': 'Moderate'})
    
    # Age (0-10 points)
    age = data.get('age') or 0
    if age >= 45:
        age_points = min(10, (age - 45) // 5)
        risk_score += age_points
        factors.append({'name': 'Age Factor', 'points': age_points, 'severity': 'Moderate'})
    
    return {
        'risk_score': min(100, risk_score),
        'risk_category': get_risk_category(min(100, risk_score)),
        'top_factors': sorted(factors, key=lambda x: x['points'], reverse=True)[:3],
        'recommendation': get_diabetes_recommendation(min(100, risk_score))
    }


# ============= KIDNEY DISEASE RISK =============

def calculate_kidney_risk(data: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculate chronic kidney disease risk.
    
    Parameters used:
    - creatinine: Serum creatinine (mg/dL)
    - gfr: Glomerular filtration rate (mL/min/1.73m²)
    - protein_urine: Protein in urine (mg/dL)
    - bp: Blood pressure
    - age: Patient age
    """
    risk_score = 0
    factors = []
    
    # Creatinine (0-35 points)
    creatinine = data.get('creatinine') or 0
    if creatinine >= 2.0:
        risk_score += 35
        factors.append({'name': 'High Creatinine', 'points': 35, 'severity': 'Critical'})
    elif creatinine >= 1.5:
        risk_score += 20
        factors.append({'name': 'Elevated Creatinine', 'points': 20, 'severity': 'High'})
    elif creatinine >= 1.2:
        risk_score += 10
        factors.append({'name': 'Borderline Creatinine', 'points': 10, 'severity': 'Moderate'})
    
    # GFR (0-35 points)
    gfr = data.get('gfr') or 100
    if gfr < 30:
        risk_score += 35
        factors.append({'name': 'Severe GFR Reduction', 'points': 35, 'severity': 'Critical'})
    elif gfr < 60:
        risk_score += 25
        factors.append({'name': 'Moderate GFR Reduction', 'points': 25, 'severity': 'High'})
    elif gfr < 90:
        risk_score += 10
        factors.append({'name': 'Mild GFR Reduction', 'points': 10, 'severity': 'Moderate'})
    
    # Proteinuria (0-20 points)
    protein = data.get('protein_urine') or 0
    if protein >= 300:
        risk_score += 20
        factors.append({'name': 'High Proteinuria', 'points': 20, 'severity': 'High'})
    elif protein >= 30:
        risk_score += 10
        factors.append({'name': 'Microalbuminuria', 'points': 10, 'severity': 'Moderate'})
    
    # Blood Pressure (0-10 points)
    bp = data.get('bp') or 0
    if bp >= 140:
        risk_score += 10
        factors.append({'name': 'Hypertension', 'points': 10, 'severity': 'High'})
    
    return {
        'risk_score': min(100, risk_score),
        'risk_category': get_risk_category(min(100, risk_score)),
        'top_factors': sorted(factors, key=lambda x: x['points'], reverse=True)[:3],
        'recommendation': get_kidney_recommendation(min(100, risk_score))
    }


# ============= LIVER DISEASE RISK =============

def calculate_liver_risk(data: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculate liver disease risk.
    
    Parameters used:
    - alt: Alanine aminotransferase (U/L)
    - ast: Aspartate aminotransferase (U/L)
    - bilirubin: Total bilirubin (mg/dL)
    - albumin: Serum albumin (g/dL)
    - platelet_count: Platelet count (×10³/μL)
    """
    risk_score = 0
    factors = []
    
    # ALT (0-25 points)
    alt = data.get('alt') or 0
    if alt >= 100:
        risk_score += 25
        factors.append({'name': 'High ALT', 'points': 25, 'severity': 'Critical'})
    elif alt >= 50:
        risk_score += 15
        factors.append({'name': 'Elevated ALT', 'points': 15, 'severity': 'High'})
    
    # AST (0-25 points)
    ast = data.get('ast') or 0
    if ast >= 100:
        risk_score += 25
        factors.append({'name': 'High AST', 'points': 25, 'severity': 'Critical'})
    elif ast >= 50:
        risk_score += 15
        factors.append({'name': 'Elevated AST', 'points': 15, 'severity': 'High'})
    
    # Bilirubin (0-20 points)
    bilirubin = data.get('bilirubin') or 0
    if bilirubin >= 3.0:
        risk_score += 20
        factors.append({'name': 'High Bilirubin', 'points': 20, 'severity': 'Critical'})
    elif bilirubin >= 1.5:
        risk_score += 10
        factors.append({'name': 'Elevated Bilirubin', 'points': 10, 'severity': 'High'})
    
    # Albumin (0-15 points)
    albumin = data.get('albumin') or 4.0
    if albumin < 3.0:
        risk_score += 15
        factors.append({'name': 'Low Albumin', 'points': 15, 'severity': 'High'})
    elif albumin < 3.5:
        risk_score += 8
        factors.append({'name': 'Borderline Albumin', 'points': 8, 'severity': 'Moderate'})
    
    # Platelet count (0-15 points)
    platelets = data.get('platelet_count') or 250
    if platelets < 100:
        risk_score += 15
        factors.append({'name': 'Low Platelets', 'points': 15, 'severity': 'High'})
    elif platelets < 150:
        risk_score += 8
        factors.append({'name': 'Borderline Platelets', 'points': 8, 'severity': 'Moderate'})
    
    return {
        'risk_score': min(100, risk_score),
        'risk_category': get_risk_category(min(100, risk_score)),
        'top_factors': sorted(factors, key=lambda x: x['points'], reverse=True)[:3],
        'recommendation': get_liver_recommendation(min(100, risk_score))
    }


# ============= HYPERTENSION RISK =============

def calculate_hypertension_risk(data: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculate hypertension risk.
    
    Parameters used:
    - systolic_bp: Systolic blood pressure
    - diastolic_bp: Diastolic blood pressure
    - age: Patient age
    - bmi: Body Mass Index
    - sodium: Dietary sodium intake
    """
    risk_score = 0
    factors = []
    
    # Systolic BP (0-40 points)
    systolic = data.get('systolic_bp') or data.get('bp') or 0
    if systolic >= 180:
        risk_score += 40
        factors.append({'name': 'Stage 3 Hypertension', 'points': 40, 'severity': 'Critical'})
    elif systolic >= 140:
        risk_score += 30
        factors.append({'name': 'Stage 2 Hypertension', 'points': 30, 'severity': 'High'})
    elif systolic >= 130:
        risk_score += 20
        factors.append({'name': 'Stage 1 Hypertension', 'points': 20, 'severity': 'High'})
    elif systolic >= 120:
        risk_score += 10
        factors.append({'name': 'Elevated BP', 'points': 10, 'severity': 'Moderate'})
    
    # Diastolic BP (0-30 points)
    diastolic = data.get('diastolic_bp') or 0
    if diastolic >= 120:
        risk_score += 30
        factors.append({'name': 'Critical Diastolic BP', 'points': 30, 'severity': 'Critical'})
    elif diastolic >= 90:
        risk_score += 20
        factors.append({'name': 'High Diastolic BP', 'points': 20, 'severity': 'High'})
    elif diastolic >= 80:
        risk_score += 10
        factors.append({'name': 'Elevated Diastolic BP', 'points': 10, 'severity': 'Moderate'})
    
    # BMI (0-15 points)
    bmi = data.get('bmi') or 0
    if bmi >= 30:
        risk_score += 15
        factors.append({'name': 'Obesity', 'points': 15, 'severity': 'High'})
    elif bmi >= 25:
        risk_score += 8
        factors.append({'name': 'Overweight', 'points': 8, 'severity': 'Moderate'})
    
    # Age (0-15 points)
    age = data.get('age') or 0
    if age >= 65:
        risk_score += 15
        factors.append({'name': 'Advanced Age', 'points': 15, 'severity': 'High'})
    elif age >= 45:
        risk_score += 8
        factors.append({'name': 'Age Factor', 'points': 8, 'severity': 'Moderate'})
    
    return {
        'risk_score': min(100, risk_score),
        'risk_category': get_risk_category(min(100, risk_score)),
        'top_factors': sorted(factors, key=lambda x: x['points'], reverse=True)[:3],
        'recommendation': get_hypertension_recommendation(min(100, risk_score))
    }


# ============= HELPER FUNCTIONS =============

def get_risk_category(score: float) -> str:
    """Categorize risk score."""
    if score >= 75:
        return "Critical"
    elif score >= 50:
        return "High"
    elif score >= 25:
        return "Moderate"
    else:
        return "Low"


def get_diabetes_recommendation(score: float) -> str:
    """Get recommendation for diabetes risk."""
    if score >= 75:
        return "Immediate endocrinologist consultation required. Start insulin therapy evaluation."
    elif score >= 50:
        return "Schedule diabetes screening. Consider oral hypoglycemic agents. Lifestyle modifications essential."
    elif score >= 25:
        return "Monitor blood glucose regularly. Implement diet and exercise program. Annual screening recommended."
    else:
        return "Maintain healthy lifestyle. Regular physical activity and balanced diet recommended."


def get_kidney_recommendation(score: float) -> str:
    """Get recommendation for kidney disease risk."""
    if score >= 75:
        return "Urgent nephrologist referral. Consider dialysis evaluation. Strict fluid and electrolyte management."
    elif score >= 50:
        return "Nephrology consultation recommended. Monitor kidney function closely. Adjust medications for renal function."
    elif score >= 25:
        return "Regular kidney function monitoring. Control blood pressure strictly. Avoid nephrotoxic medications."
    else:
        return "Maintain adequate hydration. Regular check-ups. Healthy diet with moderate protein intake."


def get_liver_recommendation(score: float) -> str:
    """Get recommendation for liver disease risk."""
    if score >= 75:
        return "Immediate hepatologist consultation. Liver biopsy may be needed. Avoid alcohol completely."
    elif score >= 50:
        return "Gastroenterology referral recommended. Liver function monitoring. Medication review essential."
    elif score >= 25:
        return "Monitor liver enzymes regularly. Limit alcohol intake. Healthy diet and weight management."
    else:
        return "Maintain liver health with balanced diet. Limit alcohol. Regular health check-ups."


def get_hypertension_recommendation(score: float) -> str:
    """Get recommendation for hypertension risk."""
    if score >= 75:
        return "Emergency BP management required. Multiple antihypertensive medications likely needed. Daily monitoring essential."
    elif score >= 50:
        return "Start antihypertensive therapy. DASH diet implementation. Regular BP monitoring at home."
    elif score >= 25:
        return "Lifestyle modifications: reduce sodium, increase exercise. Monitor BP weekly. Consider medication if no improvement."
    else:
        return "Maintain healthy lifestyle. Regular exercise. Balanced diet with limited sodium."
