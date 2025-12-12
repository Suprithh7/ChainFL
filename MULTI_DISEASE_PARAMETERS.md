# Multi-Disease Prediction - Clinical Parameters Reference

## Comprehensive Disease Risk Assessment System

This document outlines the clinical parameters used for predicting multiple diseases in the ChainFL-Care system.

---

## 1. Cardiac Disease Risk

### Parameters (10 total):
1. **Age** (years) - 18-100
2. **Resting BP** (mmHg) - 90-200
3. **Cholesterol** (mg/dL) - 100-400
4. **Glucose** (0=normal, 1=elevated)
5. **Max Heart Rate** (bpm) - 60-220
6. **ST Depression** - 0.0-6.0
7. **Troponin Level** (ng/mL) - 0.00-0.50
8. **Ejection Fraction** (%) - 15-80
9. **Serum Creatinine** (mg/dL) - 0.5-5.0
10. **BMI** - 15-50

### Risk Factors:
- Age > 65
- BP > 140
- Cholesterol > 240
- Troponin > 0.04
- Ejection Fraction < 40

---

## 2. Diabetes Risk

### Parameters (6 total):
1. **Fasting Glucose** (mg/dL) - 70-300
   - Normal: < 100
   - Prediabetes: 100-125
   - Diabetes: ≥ 126

2. **HbA1c** (%) - 4.0-14.0
   - Normal: < 5.7
   - Prediabetes: 5.7-6.4
   - Diabetes: ≥ 6.5

3. **BMI** - 15-50
   - Overweight: ≥ 25
   - Obese: ≥ 30

4. **Age** (years) - 18-100

5. **Family History** (0=no, 1=yes)

6. **Blood Pressure** (mmHg) - 90-200

### Risk Factors:
- Glucose ≥ 126 mg/dL
- HbA1c ≥ 6.5%
- BMI ≥ 30
- Age ≥ 45
- Family history positive

---

## 3. Kidney Disease Risk

### Parameters (5 total):
1. **Serum Creatinine** (mg/dL) - 0.5-10.0
   - Normal: 0.7-1.3
   - Elevated: > 1.5
   - Severe: > 2.0

2. **GFR** (Glomerular Filtration Rate) - 10-120 mL/min/1.73m²
   - Normal: > 90
   - Stage 2 CKD: 60-89
   - Stage 3 CKD: 30-59
   - Stage 4 CKD: 15-29
   - Stage 5 CKD: < 15

3. **Protein in Urine** (mg/dL) - 0-1000
   - Normal: < 30
   - Microalbuminuria: 30-300
   - Macroalbuminuria: > 300

4. **Blood Pressure** (mmHg) - 90-200

5. **Age** (years) - 18-100

### Risk Factors:
- Creatinine > 2.0
- GFR < 60
- Proteinuria > 300
- Hypertension

---

## 4. Liver Disease Risk

### Parameters (5 total):
1. **ALT** (Alanine Aminotransferase) - 0-500 U/L
   - Normal: 7-56
   - Elevated: > 50
   - High: > 100

2. **AST** (Aspartate Aminotransferase) - 0-500 U/L
   - Normal: 10-40
   - Elevated: > 50
   - High: > 100

3. **Total Bilirubin** (mg/dL) - 0.1-20.0
   - Normal: 0.1-1.2
   - Elevated: 1.2-3.0
   - High: > 3.0

4. **Albumin** (g/dL) - 2.0-5.5
   - Normal: 3.5-5.5
   - Low: < 3.5
   - Critical: < 3.0

5. **Platelet Count** (×10³/μL) - 50-450
   - Normal: 150-400
   - Low: < 150
   - Thrombocytopenia: < 100

### Risk Factors:
- ALT/AST > 100
- Bilirubin > 3.0
- Albumin < 3.0
- Platelets < 100

---

## 5. Hypertension Risk

### Parameters (5 total):
1. **Systolic BP** (mmHg) - 90-220
   - Normal: < 120
   - Elevated: 120-129
   - Stage 1: 130-139
   - Stage 2: 140-179
   - Stage 3: ≥ 180

2. **Diastolic BP** (mmHg) - 60-140
   - Normal: < 80
   - Elevated: 80-89
   - Stage 1: 90-99
   - Stage 2: 100-119
   - Stage 3: ≥ 120

3. **Age** (years) - 18-100

4. **BMI** - 15-50

5. **Sodium Intake** (mg/day) - 500-8000
   - Recommended: < 2300
   - High: > 3000

### Risk Factors:
- Systolic BP ≥ 140
- Diastolic BP ≥ 90
- Age ≥ 65
- BMI ≥ 30
- High sodium intake

---

## Combined Assessment Parameters

### Core Parameters (Used across multiple diseases):
1. **Age** - All diseases
2. **BMI** - Cardiac, Diabetes, Hypertension
3. **Blood Pressure** - Cardiac, Diabetes, Kidney, Hypertension
4. **Creatinine** - Cardiac, Kidney

### Disease-Specific Parameters:

**Cardiac Only:**
- Troponin, Ejection Fraction, ST Depression, Max HR, Cholesterol

**Diabetes Only:**
- Glucose, HbA1c, Family History

**Kidney Only:**
- GFR, Protein in Urine

**Liver Only:**
- ALT, AST, Bilirubin, Albumin, Platelets

**Hypertension Only:**
- Systolic/Diastolic BP, Sodium Intake

---

## Sample Test Values

### High Risk Patient (Multiple Diseases):
```
Age: 68
BMI: 32
Systolic BP: 165
Diastolic BP: 95
Glucose: 145
HbA1c: 7.2
Creatinine: 1.8
GFR: 45
ALT: 85
AST: 92
Cholesterol: 260
Troponin: 0.08
Ejection Fraction: 38

Expected Results:
- Cardiac Risk: 85% (Critical)
- Diabetes Risk: 75% (Critical)
- Kidney Risk: 65% (High)
- Liver Risk: 45% (Moderate)
- Hypertension Risk: 80% (Critical)
```

### Low Risk Patient:
```
Age: 35
BMI: 22
Systolic BP: 115
Diastolic BP: 75
Glucose: 85
HbA1c: 5.2
Creatinine: 0.9
GFR: 105
ALT: 25
AST: 28
Cholesterol: 175
Troponin: 0.01
Ejection Fraction: 65

Expected Results:
- Cardiac Risk: 15% (Low)
- Diabetes Risk: 10% (Low)
- Kidney Risk: 5% (Low)
- Liver Risk: 8% (Low)
- Hypertension Risk: 12% (Low)
```

---

## Implementation Notes

### Frontend Input Form:
- Group parameters by disease
- Show/hide parameters based on selected diseases
- Provide normal ranges as placeholders
- Validate input ranges

### Backend Processing:
- Calculate risk for each selected disease
- Return comprehensive report
- Provide disease-specific recommendations
- Generate comparative risk visualization

### Database Schema:
```sql
patient_assessments:
- patient_id
- assessment_date
- cardiac_risk
- diabetes_risk
- kidney_risk
- liver_risk
- hypertension_risk
- clinical_parameters (JSON)
```

---

## Clinical Validation

All risk algorithms based on:
- American Heart Association guidelines (Cardiac)
- American Diabetes Association criteria (Diabetes)
- KDIGO guidelines (Kidney)
- AASLD recommendations (Liver)
- JNC 8 guidelines (Hypertension)

**Note:** This is a screening tool. Clinical diagnosis requires physician evaluation and additional testing.
