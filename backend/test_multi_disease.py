"""
Test script for multi-disease prediction API.
Tests cardiac + diabetes + kidney + liver + hypertension predictions.
"""
import requests
import json

# API endpoint
API_URL = "http://127.0.0.1:8000/api/predict"

# Test data with ALL disease parameters
test_patient = {
    # Cardiac parameters (required)
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
    
    # Diabetes parameters (optional)
    "hba1c": 7.2,
    
    # Kidney parameters (optional)
    "gfr": 45,
    "protein_urine": 250,
    
    # Liver parameters (optional)
    "alt": 85,
    "ast": 92,
    "bilirubin": 2.5,
    "albumin": 3.2,
    "platelet_count": 120,
    
    # Hypertension parameters (optional)
    "systolic_bp": 165,
    "diastolic_bp": 95
}

print("=" * 70)
print("MULTI-DISEASE PREDICTION TEST")
print("=" * 70)
print("\n📊 Testing with comprehensive patient data...")
print(f"Patient Age: {test_patient['age']}")
print(f"BMI: {test_patient['bmi']}")
print(f"HbA1c: {test_patient['hba1c']}%")
print(f"GFR: {test_patient['gfr']} mL/min")
print(f"ALT: {test_patient['alt']} U/L")
print(f"Systolic BP: {test_patient['systolic_bp']} mmHg")

print("\n🔄 Sending request to API...")

try:
    response = requests.post(API_URL, json=test_patient, timeout=10)
    
    print(f"\n✅ Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        print("\n" + "=" * 70)
        print("PREDICTION RESULTS")
        print("=" * 70)
        
        # Cardiac Risk (Primary)
        print(f"\n🫀 CARDIAC DISEASE:")
        print(f"   Risk Score: {data['risk_score']}%")
        print(f"   Category: {data['risk_category']}")
        print(f"   Recommendation: {data['recommendation'][:80]}...")
        
        # Multi-Disease Risks
        if data.get('multi_disease_risks'):
            print(f"\n📋 ADDITIONAL DISEASE RISKS:")
            
            for disease, risk_data in data['multi_disease_risks'].items():
                print(f"\n   {disease.upper()}:")
                print(f"      Risk Score: {risk_data['risk_score']}%")
                print(f"      Category: {risk_data['risk_category']}")
                print(f"      Top Factors:")
                for factor in risk_data['top_factors'][:2]:
                    print(f"         - {factor['name']}: {factor['points']} points ({factor['severity']})")
                print(f"      Recommendation: {risk_data['recommendation'][:60]}...")
        else:
            print("\n⚠️  No multi-disease risks calculated")
        
        # Forecast
        if data.get('forecast'):
            print(f"\n📈 20-DAY FORECAST:")
            print(f"   Day 1: {data['forecast'][0]['risk_score']}%")
            print(f"   Day 10: {data['forecast'][9]['risk_score']}%")
            print(f"   Day 20: {data['forecast'][19]['risk_score']}%")
        
        print("\n" + "=" * 70)
        print("✅ MULTI-DISEASE PREDICTION WORKING!")
        print("=" * 70)
        
        # Save full response
        with open('multi_disease_test_result.json', 'w') as f:
            json.dump(data, f, indent=2)
        print("\n💾 Full response saved to: multi_disease_test_result.json")
        
    else:
        print(f"\n❌ Error: {response.status_code}")
        print(response.text)
        
except requests.exceptions.ConnectionError:
    print("\n❌ ERROR: Could not connect to backend!")
    print("   Make sure the backend is running on http://127.0.0.1:8000")
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")

print("\n" + "=" * 70)
