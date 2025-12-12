import requests
import json

# Test the prediction endpoint
url = "http://127.0.0.1:8000/api/predict"
data = {
    "age": 65,
    "bp": 140,
    "cholesterol": 240,
    "glucose": 1,
    "maxHr": 150,
    "stDepression": 2.0,
    "troponin": 0.08,
    "ejectionFraction": 42,
    "creatinine": 1.4,
    "bmi": 28.5
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
