"""
Gemini API Predictor for Cardiac Risk Assessment
Uses Google Gemini AI to provide intelligent risk predictions
"""
import google.generativeai as genai
import json
import os
from datetime import datetime
from typing import Dict, Any

def predict_with_gemini(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Use Gemini API to predict cardiac risk
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("⚠️ Gemini API key not found, using fallback prediction")
        return fallback_prediction(patient_data)
    
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        # Build medical prompt
        prompt = build_medical_prompt(patient_data)
        
        # Call Gemini API
        response = model.generate_content(prompt)
        
        if response.text:
            result = parse_gemini_response(response.text)
            print(f"✅ Gemini prediction successful: {result['risk_score']}% risk")
            return result
        else:
            print(f"⚠️ Gemini API returned empty response, using fallback")
            return fallback_prediction(patient_data)
            
    except Exception as e:
        print(f"⚠️ Gemini API exception: {str(e)}, using fallback")
        return fallback_prediction(patient_data)


def build_medical_prompt(data: Dict[str, Any]) -> str:
    """
    Build structured medical prompt for Gemini
    """
    return f"""You are an expert medical AI assistant specializing in cardiac risk assessment. Analyze this patient's cardiac risk profile and provide a comprehensive evaluation.

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

Based on established medical guidelines and cardiac risk assessment protocols, provide your evaluation in EXACTLY this JSON format (no additional text):

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
- Multi-disease risks should be realistic percentages

Respond with ONLY the JSON object, no other text."""


def parse_gemini_response(response_text: str) -> Dict[str, Any]:
    """
    Parse Gemini API response and extract prediction
    """
    try:
        # Clean response - remove markdown code blocks if present
        cleaned = response_text.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.startswith('```'):
            cleaned = cleaned[3:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        # Parse JSON
        prediction = json.loads(cleaned)
        
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
            "prediction_method": "Gemini AI"
        }
    except Exception as e:
        print(f"⚠️ Error parsing Gemini response: {str(e)}")
        print(f"Response was: {response_text[:200]}")
        raise


def fallback_prediction(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fallback rule-based prediction if Gemini API is unavailable
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
