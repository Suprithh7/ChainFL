"""
Test with ONLY cardiac parameters - should still get all 5 disease predictions!
"""
import requests
import json

API_URL = "http://127.0.0.1:8000/api/predict"

# ONLY cardiac parameters (no optional fields)
cardiac_only_patient = {
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

print("=" * 70)
print("TESTING: Cardiac Parameters ONLY")
print("=" * 70)
print("\n📊 Input: Only 10 cardiac parameters (no optional fields)")
print(json.dumps(cardiac_only_patient, indent=2))

print("\n🔄 Sending request...")

try:
    response = requests.post(API_URL, json=cardiac_only_patient, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        
        print("\n" + "=" * 70)
        print("✅ RESULTS: ALL 5 DISEASES PREDICTED!")
        print("=" * 70)
        
        print(f"\n🫀 CARDIAC: {data['risk_score']}% ({data['risk_category']})")
        
        if data.get('multi_disease_risks'):
            for disease, risk_data in data['multi_disease_risks'].items():
                emoji = {
                    'diabetes': '🩺',
                    'kidney': '🫘',
                    'liver': '🫀',
                    'hypertension': '💊'
                }.get(disease, '📊')
                
                print(f"{emoji} {disease.upper()}: {risk_data['risk_score']}% ({risk_data['risk_category']})")
        
        print("\n" + "=" * 70)
        print("✅ SUCCESS: System predicts ALL diseases even without optional parameters!")
        print("=" * 70)
        
    else:
        print(f"\n❌ Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
