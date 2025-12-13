import requests

# Test FL endpoint
try:
    response = requests.get('http://127.0.0.1:8000/blockchain/fl/metrics', timeout=5)
    print(f"FL Metrics Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Current Round: {data.get('round', 'N/A')}")
        print(f"Accuracy: {data.get('accuracy', 'N/A')}")
except Exception as e:
    print(f"ERROR: {e}")
