"""
Direct API test to verify prediction endpoint
"""
import requests
import json

print("=" * 70)
print("TESTING PREDICTION API ENDPOINT")
print("=" * 70)

# Test data
test_data = {
    "age": 55,
    "bp": 145,
    "cholesterol": 210,
    "glucose": 130,
    "maxHr": 135,
    "stDepression": 1.5,
    "troponin": 0.2,
    "ejectionFraction": 52,
    "creatinine": 1.3,
    "bmi": 27
}

print("\n📊 Sending prediction request...")
print(f"Patient: Age={test_data['age']}, BP={test_data['bp']}, Cholesterol={test_data['cholesterol']}\n")

try:
    response = requests.post(
        'http://127.0.0.1:8000/api/predict',
        json=test_data,
        headers={'Content-Type': 'application/json'},
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("\n✅ SUCCESS! Prediction API is working!\n")
        print("=" * 70)
        print(f"🎯 Risk Score: {result['risk_score']}%")
        print(f"📊 Risk Category: {result['risk_category']}")
        print(f"⚠️  Top Factors: {', '.join(result['top_factors'])}")
        print(f"💡 Recommendation: {result['recommendation'][:80]}...")
        print(f"🔬 Method: {result['prediction_method']}")
        print("=" * 70)
        print("\n✅ READY FOR HACKATHON!")
    else:
        print(f"\n❌ Error Response:")
        print(response.text)
        
except requests.exceptions.ConnectionError:
    print("\n❌ Cannot connect to backend!")
    print("Make sure backend is running on http://127.0.0.1:8000")
except Exception as e:
    print(f"\n❌ Exception: {str(e)}")
