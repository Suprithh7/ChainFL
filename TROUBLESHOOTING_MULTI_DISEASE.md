# Multi-Disease Prediction - Troubleshooting Guide

## Current Issue

Multi-disease risks are returning `None` instead of actual predictions.

## Quick Fix Steps

### Step 1: Restart Backend
The backend might not have reloaded properly. Restart it:

```bash
# Stop the current backend (Ctrl+C in the terminal)
# Then restart:
cd c:\Users\suprisuprith\Downloads\BMSITfinal\backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Step 2: Test API Directly
```bash
python test_cardiac_only.py
```

Expected output should show all 5 diseases.

### Step 3: Check Browser Console
1. Open http://localhost:5173/prediction
2. Press F12 to open browser console
3. Fill form and click "Generate Prediction"
4. Look for console.log messages showing:
   - "🔍 Prediction Response:"
   - "🏥 Multi-Disease Risks:"

## What Should Appear

After prediction, you should see:

```
🫀 Cardiac Risk: 81.8% (Critical)

📊 Complete Health Risk Assessment
┌─────────────────┬─────────────────┐
│ 🩺 Diabetes     │ 🫘 Kidney       │
│ XX% (Category)  │ XX% (Category)  │
├─────────────────┼─────────────────┤
│ 🫀 Liver        │ 💊 Hypertension │
│ XX% (Category)  │ XX% (Category)  │
└─────────────────┴─────────────────┘
```

## If Still Not Working

### Option A: Check Backend Logs
Look at the backend terminal for errors like:
- "Multi-disease calculation failed"
- Import errors
- Module not found

### Option B: Manual Test
```python
# In backend directory
python
>>> from utils.multi_disease import calculate_diabetes_risk
>>> result = calculate_diabetes_risk({
...     'glucose': 120,
...     'hba1c': 5.5,
...     'bmi': 28.5,
...     'age': 65,
...     'bp': 145
... })
>>> print(result)
```

Should print a dictionary with risk_score, risk_category, etc.

## Common Issues

1. **Backend not reloaded**: Restart uvicorn
2. **Module import error**: Check `backend/utils/multi_disease.py` exists
3. **Frontend not refreshed**: Hard refresh browser (Ctrl+F5)
4. **Data not returned**: Check backend terminal for errors

## Current Files

- ✅ `backend/utils/multi_disease.py` - Disease algorithms
- ✅ `backend/main.py` - Updated with multi-disease logic
- ✅ `frontend/src/pages/PatientPrediction.jsx` - Updated UI

## Next Steps

1. Restart backend
2. Test prediction
3. Check browser console
4. Report what you see in console.log

The code is correct, likely just needs a proper restart!
