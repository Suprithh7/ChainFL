"""
DeepSeek API Predictor for Cardiac Risk Assessment
Uses DeepSeek AI to provide intelligent risk predictions
"""
import httpx
import json
import os
from datetime import datetime
from typing import Dict, Any

async def predict_with_deepseek(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Use DeepSeek API to predict cardiac risk
    """
    api_key = os.getenv("DEEPSEEK_API_KEY")
    
    if not api_key:
        print("⚠️ DeepSeek API key not found, using fallback prediction")
        return fallback_prediction(patient_data)
    
    try:
        # Build medical prompt
        prompt = build_medical_prompt(patient_data)
        
        # Call DeepSeek API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert medical AI assistant specializing in cardiac risk assessment. Provide accurate, evidence-based risk evaluations."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.3,  # Low temperature for consistent medical advice
                    "response_format": {"type": "json_object"}
                },
                timeout=30.0
            )
        
        if response.status_code == 200:
            result = parse_deepseek_response(response.json())
            print(f"✅ DeepSeek prediction successful: {result['risk_score']}% risk")
            return result
        else:
            print(f"⚠️ DeepSeek API error: {response.status_code}, using fallback")
            return fallback_prediction(patient_data)
            
    except Exception as e:
        print(f"⚠️ DeepSeek API exception: {str(e)}, using fallback")
        return fallback_prediction(patient_data)


def build_medical_prompt(data: Dict[str, Any]) -> str:
    """
    Build structured medical prompt for DeepSeek
    """
    return f"""Analyze this patient's cardiac risk profile and provide a comprehensive assessment.

PATIENT DATA:
- Age: {data.get('age')} years
- Blood Pressure: {data.get('bp')} mmHg
- Cholesterol: {data.get('cholesterol')} mg/dL
- Glucose: {data.get('glucose')} mg/dL
- Max Heart Rate: {data.get('maxHr')} bpm
- ST Depression: {data.get('stDepression')}
- Troponin: {data.get('troponin')} ng/mL
- Ejection Fraction: {data.get('ejectionFraction')}%
- Creatinine: {data.get('creatinine')} mg/dL
- BMI: {data.get('bmi')}

ADDITIONAL PARAMETERS (if available):
- HbA1c: {data.get('hba1c', 'N/A')}%
- GFR: {data.get('gfr', 'N/A')} mL/min
- Protein in Urine: {data.get('protein_urine', 'N/A')} mg/dL
- ALT: {data.get('alt', 'N/A')} U/L
- AST: {data.get('ast', 'N/A')} U/L
- Bilirubin: {data.get('bilirubin', 'N/A')} mg/dL
- Albumin: {data.get('albumin', 'N/A')} g/dL
- Platelet Count: {data.get('platelet_count', 'N/A')} x10^9/L
- Systolic BP: {data.get('systolic_bp', 'N/A')} mmHg
- Diastolic BP: {data.get('diastolic_bp', 'N/A')} mmHg

TASK:
Based on established medical guidelines and cardiac risk assessment protocols, provide a comprehensive evaluation in the following JSON format:

{{
  "risk_score": <integer 0-100>,
  "risk_category": "<Low|Moderate|High|Critical>",
  "top_factors": ["<factor1>", "<factor2>", "<factor3>"],
  "recommendation": "<brief clinical recommendation>",
  "multi_disease_risks": {{
    "Heart Attack": <percentage 0-100>,
    "Stroke": <percentage 0-100>,
    "Heart Failure": <percentage 0-100>
  }}
}}

GUIDELINES:
- Risk Score: 0-30 = Low, 31-60 = Moderate, 61-80 = High, 81-100 = Critical
- Consider age, BP, cholesterol, glucose, cardiac markers (troponin, ejection fraction)
- Top factors should be the 3 most concerning parameters
- Recommendation should be actionable and specific
- Multi-disease risks should be realistic percentages based on the patient profile

Provide only the JSON response, no additional text."""


def parse_deepseek_response(api_response: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse DeepSeek API response and extract prediction
    """
    try:
        content = api_response["choices"][0]["message"]["content"]
        prediction = json.loads(content)
        
        # Ensure all required fields are present
        return {
            "risk_score": int(prediction.get("risk_score", 50)),
            "risk_category": prediction.get("risk_category", "Moderate"),
            "top_factors": prediction.get("top_factors", ["Age", "Blood Pressure", "Cholesterol"]),
            "recommendation": prediction.get("recommendation", "Consult with a cardiologist for detailed evaluation"),
            "multi_disease_risks": prediction.get("multi_disease_risks", {
                "Heart Attack": 50,
                "Stroke": 40,
                "Heart Failure": 45
            }),
            "timestamp": datetime.now().isoformat(),
            "prediction_method": "DeepSeek AI"
        }
    except Exception as e:
        print(f"⚠️ Error parsing DeepSeek response: {str(e)}")
        raise


def fallback_prediction(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fallback rule-based prediction if DeepSeek API is unavailable
    """
    risk_score = 0
    factors = []
    
    # Age risk
    age = data.get('age', 0)
    if age > 65:
        risk_score += 25
        factors.append("Advanced age")
    elif age > 55:
        risk_score += 15
        factors.append("Age")
    
    # Blood pressure risk
    bp = data.get('bp', 0)
    if bp > 160:
        risk_score += 20
        factors.append("Severe hypertension")
    elif bp > 140:
        risk_score += 12
        factors.append("Hypertension")
    
    # Cholesterol risk
    cholesterol = data.get('cholesterol', 0)
    if cholesterol > 240:
        risk_score += 15
        factors.append("High cholesterol")
    elif cholesterol > 200:
        risk_score += 8
    
    # Glucose risk
    glucose = data.get('glucose', 0)
    if glucose > 160:
        risk_score += 15
        factors.append("Diabetes")
    elif glucose > 125:
        risk_score += 8
        factors.append("Prediabetes")
    
    # Troponin (cardiac damage marker)
    troponin = data.get('troponin', 0)
    if troponin > 0.5:
        risk_score += 20
        factors.append("Elevated troponin")
    
    # Ejection fraction (heart pump efficiency)
    ef = data.get('ejectionFraction', 60)
    if ef < 40:
        risk_score += 20
        factors.append("Reduced ejection fraction")
    elif ef < 50:
        risk_score += 10
    
    # Cap at 100
    risk_score = min(risk_score, 100)
    
    # Determine category
    if risk_score < 30:
        category = "Low"
    elif risk_score < 60:
        category = "Moderate"
    elif risk_score < 80:
        category = "High"
    else:
        category = "Critical"
    
    # Select top 3 factors
    top_factors = factors[:3] if factors else ["Age", "Blood Pressure", "Cholesterol"]
    
    return {
        "risk_score": risk_score,
        "risk_category": category,
        "top_factors": top_factors,
        "recommendation": f"Based on {category.lower()} risk assessment, consult with a cardiologist for comprehensive evaluation and treatment planning.",
        "multi_disease_risks": {
            "Heart Attack": min(risk_score * 0.85, 100),
            "Stroke": min(risk_score * 0.65, 100),
            "Heart Failure": min(risk_score * 0.75, 100)
        },
        "timestamp": datetime.now().isoformat(),
        "prediction_method": "Rule-based (Fallback)"
    }
