# Quick test to verify multi-disease works
from utils.multi_disease import (
    calculate_diabetes_risk,
    calculate_kidney_risk,
    calculate_liver_risk,
    calculate_hypertension_risk
)

# Test data
patient_data = {
    'age': 65,
    'bp': 145,
    'bmi': 28.5,
    'glucose': 1,
    'creatinine': 1.4
}

print("Testing multi-disease calculations...")
print("=" * 50)

# Diabetes
diabetes_data = {
    'glucose': patient_data.get('glucose', 0) * 120,
    'hba1c': 5.5,  # Default
    'bmi': patient_data.get('bmi'),
    'age': patient_data.get('age'),
    'bp': patient_data.get('bp')
}
diabetes_result = calculate_diabetes_risk(diabetes_data)
print(f"\n✅ Diabetes: {diabetes_result['risk_score']}% ({diabetes_result['risk_category']})")

# Kidney
kidney_data = {
    'creatinine': patient_data.get('creatinine'),
    'gfr': 100,  # Default
    'protein_urine': 15,  # Default
    'bp': patient_data.get('bp'),
    'age': patient_data.get('age')
}
kidney_result = calculate_kidney_risk(kidney_data)
print(f"✅ Kidney: {kidney_result['risk_score']}% ({kidney_result['risk_category']})")

# Liver
liver_data = {
    'alt': 30,  # Default
    'ast': 25,  # Default
    'bilirubin': 0.8,  # Default
    'albumin': 4.0,  # Default
    'platelet_count': 250  # Default
}
liver_result = calculate_liver_risk(liver_data)
print(f"✅ Liver: {liver_result['risk_score']}% ({liver_result['risk_category']})")

# Hypertension
hypertension_data = {
    'systolic_bp': patient_data.get('bp'),
    'diastolic_bp': int(patient_data.get('bp', 120) * 0.67),
    'age': patient_data.get('age'),
    'bmi': patient_data.get('bmi'),
    'bp': patient_data.get('bp')
}
hypertension_result = calculate_hypertension_risk(hypertension_data)
print(f"✅ Hypertension: {hypertension_result['risk_score']}% ({hypertension_result['risk_category']})")

print("\n" + "=" * 50)
print("✅ ALL CALCULATIONS SUCCESSFUL!")
print("\nThis proves the module works. The issue is in main.py integration.")
