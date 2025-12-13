import requests
import json

minimal_data = {
    'age': 55,
    'bp': 145,
    'cholesterol': 210,
    'glucose': 130
}

print("Testing with:", minimal_data)
response = requests.post('http://127.0.0.1:8000/api/predict', json=minimal_data)
print(f"Status: {response.status_code}")
if response.status_code != 200:
    print("ERROR:")
    print(json.dumps(response.json(), indent=2))
else:
    print("SUCCESS!")
    result = response.json()
    print(f"Risk: {result['risk_score']}%")
    print(f"Diseases: {list(result.get('multi_disease_risks', {}).keys())}")
