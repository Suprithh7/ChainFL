import requests
import json

# Test with MINIMAL data (only 4 required fields!)
minimal_data = {
    'age': 55,
    'bp': 145,
    'cholesterol': 210,
    'glucose': 130
}

print("=" * 60)
print("TESTING WITH MINIMAL DATA (Only 4 fields!)")
print("=" * 60)
print(f"Data: {minimal_data}")
print()

response = requests.post('http://127.0.0.1:8000/api/predict', json=minimal_data)

print(f"Status Code: {response.status_code}")
print()

if response.status_code == 200:
    result = response.json()
    print(f"✅ Risk Score: {result['risk_score']}%")
    print(f"📊 Category: {result['risk_category']}")
    print(f"⚠️  Top Factors: {', '.join(result['top_factors'])}")
    print(f"🔬 Method: {result['prediction_method']}")
    print()
    print("=" * 60)
    print("✅ MINIMAL DATA WORKS!")
    print("=" * 60)
else:
    print(f"❌ Error: {response.text}")
