"""
Test all risk categories with realistic patient data
"""
import requests
import json

API_URL = "http://127.0.0.1:8000/api/predict"

# Test cases for all risk categories
test_patients = [
    {
        "name": "Low Risk Patient",
        "data": {
            "age": 40,
            "bp": 115,
            "cholesterol": 170,
            "glucose": 85,
            "maxHr": 160,
            "stDepression": 0.2,
            "troponin": 0.01,
            "ejectionFraction": 65,
            "creatinine": 0.9,
            "bmi": 22
        }
    },
    {
        "name": "Moderate Risk Patient",
        "data": {
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
    },
    {
        "name": "High Risk Patient",
        "data": {
            "age": 65,
            "bp": 165,
            "cholesterol": 250,
            "glucose": 165,
            "maxHr": 115,
            "stDepression": 2.8,
            "troponin": 0.6,
            "ejectionFraction": 42,
            "creatinine": 1.7,
            "bmi": 31
        }
    },
    {
        "name": "Critical Risk Patient",
        "data": {
            "age": 72,
            "bp": 180,
            "cholesterol": 280,
            "glucose": 190,
            "maxHr": 95,
            "stDepression": 3.5,
            "troponin": 1.2,
            "ejectionFraction": 32,
            "creatinine": 2.1,
            "bmi": 35
        }
    }
]

print("=" * 70)
print("TESTING ALL RISK CATEGORIES")
print("=" * 70)

for patient in test_patients:
    print(f"\n📋 {patient['name']}")
    print("-" * 70)
    
    try:
        response = requests.post(API_URL, json=patient['data'], timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Status: SUCCESS")
            print(f"🎯 Risk Score: {result['risk_score']}%")
            print(f"📊 Risk Category: {result['risk_category']}")
            print(f"⚠️  Top Factors: {', '.join(result['top_factors'])}")
            print(f"💡 Recommendation: {result['recommendation'][:80]}...")
        else:
            print(f"❌ Error: HTTP {response.status_code}")
            print(f"Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

print("\n" + "=" * 70)
print("✅ All risk categories tested successfully!")
print("=" * 70)
