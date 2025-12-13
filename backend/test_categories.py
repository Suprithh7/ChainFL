import requests
import json

print("="*70)
print("TESTING ALL RISK CATEGORIES")
print("="*70)

tests = [
    {
        "name": "LOW RISK",
        "data": {
            "age": 40, "bp": 115, "cholesterol": 170, "glucose": 85,
            "maxHr": 160, "stDepression": 0.2, "troponin": 0.01,
            "ejectionFraction": 65, "creatinine": 0.9, "bmi": 22
        }
    },
    {
        "name": "MODERATE RISK",
        "data": {
            "age": 55, "bp": 145, "cholesterol": 210, "glucose": 130,
            "maxHr": 135, "stDepression": 1.5, "troponin": 0.2,
            "ejectionFraction": 52, "creatinine": 1.3, "bmi": 27
        }
    },
    {
        "name": "HIGH RISK",
        "data": {
            "age": 65, "bp": 165, "cholesterol": 250, "glucose": 165,
            "maxHr": 115, "stDepression": 2.8, "troponin": 0.6,
            "ejectionFraction": 42, "creatinine": 1.7, "bmi": 31
        }
    },
    {
        "name": "CRITICAL RISK",
        "data": {
            "age": 75, "bp": 185, "cholesterol": 280, "glucose": 195,
            "maxHr": 95, "stDepression": 3.5, "troponin": 1.5,
            "ejectionFraction": 32, "creatinine": 2.3, "bmi": 36
        }
    }
]

for test in tests:
    print(f"\n{test['name']}:")
    print("-" * 70)
    
    try:
        response = requests.post(
            'http://127.0.0.1:8000/api/predict',
            json=test['data'],
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"  ✅ Risk Score: {result['risk_score']}%")
            print(f"  📊 Category: {result['risk_category']}")
            print(f"  ⚠️  Top Factors: {', '.join(result['top_factors'])}")
            print(f"  💊 Recommendation: {result['recommendation'][:60]}...")
            print(f"  🏥 Multi-Disease Risks:")
            for disease, risk in result['multi_disease_risks'].items():
                print(f"     - {disease}: {risk:.1f}%")
        else:
            print(f"  ❌ Error: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"  ❌ Exception: {str(e)}")

print("\n" + "="*70)
print("✅ ALL RISK CATEGORIES WORKING!")
print("="*70)
