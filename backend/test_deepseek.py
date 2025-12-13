"""
Test DeepSeek API prediction endpoint
"""
import requests
import json

# Test data - high risk patient
test_data = {
    "age": 65,
    "bp": 150,
    "cholesterol": 250,
    "glucose": 160,
    "maxHr": 120,
    "stDepression": 2.5,
    "troponin": 0.8,
    "ejectionFraction": 45,
    "creatinine": 1.5,
    "bmi": 28
}

print("🧪 Testing DeepSeek API Prediction...")
print(f"📊 Patient Data: Age={test_data['age']}, BP={test_data['bp']}, Cholesterol={test_data['cholesterol']}")
print("\n⏳ Calling API...\n")

try:
    response = requests.post(
        'http://127.0.0.1:8000/api/predict',
        json=test_data,
        timeout=30
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ SUCCESS! DeepSeek API is working!\n")
        print("=" * 60)
        print(f"🎯 Risk Score: {result.get('risk_score')}%")
        print(f"📊 Risk Category: {result.get('risk_category')}")
        print(f"⚠️  Top Risk Factors: {', '.join(result.get('top_factors', []))}")
        print(f"💡 Recommendation: {result.get('recommendation')}")
        print(f"🔬 Prediction Method: {result.get('prediction_method', 'Unknown')}")
        print("\n🏥 Multi-Disease Risks:")
        for disease, risk in result.get('multi_disease_risks', {}).items():
            print(f"   - {disease}: {risk}%")
        print("=" * 60)
        print("\n📋 Full Response:")
        print(json.dumps(result, indent=2))
    else:
        print(f"❌ Error: HTTP {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")
