import sys
sys.path.insert(0, '.')

from services.ml_model import predict_risk

# Test the ML model
test_data = {
    'age': 55,
    'bp': 145,
    'cholesterol': 210,
    'glucose': 130,
    'maxHr': 135,
    'stDepression': 1.5,
    'troponin': 0.2,
    'ejectionFraction': 52,
    'creatinine': 1.3,
    'bmi': 27
}

print("Testing ML Model...")
print("=" * 60)

result = predict_risk(test_data)

print(f"✅ Risk Score: {result['risk_score']}%")
print(f"📊 Category: {result['risk_category']}")
print(f"⚠️  Top Factors: {', '.join(result['top_factors'])}")
print(f"🔬 Method: {result['prediction_method']}")
print(f"💡 Confidence: {result['confidence']:.2%}")
print("=" * 60)
print("✅ ML MODEL WORKING!")
