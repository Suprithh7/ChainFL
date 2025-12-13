"""
Simple ML Model for Cardiac Risk Prediction
Uses scikit-learn Random Forest for reliable predictions
No external API dependencies - works 100% offline
"""
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pickle
import os
from datetime import datetime

class CardiacRiskModel:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = [
            'age', 'bp', 'cholesterol', 'glucose', 'maxHr',
            'stDepression', 'troponin', 'ejectionFraction', 
            'creatinine', 'bmi'
        ]
        self._train_model()
    
    def _train_model(self):
        """Train a simple Random Forest model with synthetic data"""
        # Generate synthetic training data based on medical guidelines
        np.random.seed(42)
        n_samples = 1000
        
        # Generate features
        X = []
        y = []
        
        for _ in range(n_samples):
            # Randomly generate patient data
            age = np.random.randint(30, 85)
            bp = np.random.randint(100, 200)
            cholesterol = np.random.randint(150, 300)
            glucose = np.random.randint(70, 200)
            maxHr = np.random.randint(80, 180)
            stDepression = np.random.uniform(0, 4)
            troponin = np.random.uniform(0, 2)
            ejectionFraction = np.random.randint(25, 75)
            creatinine = np.random.uniform(0.5, 3)
            bmi = np.random.uniform(18, 40)
            
            # Calculate risk score based on medical guidelines
            risk_score = 0
            
            if age > 65: risk_score += 25
            elif age > 55: risk_score += 15
            
            if bp > 160: risk_score += 20
            elif bp > 140: risk_score += 12
            
            if cholesterol > 240: risk_score += 15
            elif cholesterol > 200: risk_score += 8
            
            if glucose > 160: risk_score += 15
            elif glucose > 125: risk_score += 8
            
            if troponin > 0.5: risk_score += 20
            if ejectionFraction < 40: risk_score += 20
            elif ejectionFraction < 50: risk_score += 10
            
            if stDepression > 2.0: risk_score += 10
            if creatinine > 1.5: risk_score += 8
            if bmi > 30: risk_score += 6
            
            risk_score = min(risk_score, 100)
            
            # Assign category (0=Low, 1=Moderate, 2=High)
            if risk_score < 40:
                category = 0  # Low
            elif risk_score < 70:
                category = 1  # Moderate
            else:
                category = 2  # High
            
            X.append([age, bp, cholesterol, glucose, maxHr, stDepression, 
                     troponin, ejectionFraction, creatinine, bmi])
            y.append(category)
        
        X = np.array(X)
        y = np.array(y)
        
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(X_scaled, y)
        
        print("✅ ML Model trained successfully!")
    
    def predict(self, patient_data: dict) -> dict:
        """
        Predict cardiac risk for a patient
        Returns risk score, category, and detailed analysis
        """
        try:
            # Extract features in correct order
            features = []
            for feature_name in self.feature_names:
                value = patient_data.get(feature_name, 0)
                features.append(float(value))
            
            features_array = np.array([features])
            
            # Scale features
            features_scaled = self.scaler.transform(features_array)
            
            # Get prediction
            category_pred = self.model.predict(features_scaled)[0]
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            # Get feature importances for this prediction
            feature_importances = self.model.feature_importances_
            
            # Calculate risk score (0-100)
            risk_score = self._calculate_risk_score(patient_data, probabilities)
            
            # Determine category name
            categories = ['Low', 'Moderate', 'High']
            risk_category = categories[category_pred]
            
            # Get top risk factors
            top_factors = self._get_top_factors(patient_data, feature_importances)
            
            # Generate recommendation
            recommendation = self._get_recommendation(risk_category, patient_data)
            
            # Calculate multi-disease risks based on patient data
            multi_disease_risks = self._calculate_disease_risks(patient_data, risk_score)
            
            return {
                "risk_score": int(risk_score),
                "risk_category": risk_category,
                "top_factors": top_factors,
                "recommendation": recommendation,
                "multi_disease_risks": multi_disease_risks,
                "confidence": float(probabilities[category_pred]),
                "timestamp": datetime.now().isoformat(),
                "prediction_method": "Random Forest ML Model"
            }
            
        except Exception as e:
            print(f"❌ Prediction error: {str(e)}")
            raise
    
    def _calculate_risk_score(self, data: dict, probabilities: np.ndarray) -> float:
        """Calculate risk score 0-100 based on probabilities and data"""
        # Weight probabilities: Low=0-33, Moderate=34-66, High=67-100
        risk_score = (
            probabilities[0] * 16.5 +  # Low risk contributes 0-33
            probabilities[1] * 50 +     # Moderate contributes 34-66
            probabilities[2] * 83.5     # High contributes 67-100
        )
        
        # Add bonus points for severe individual factors
        if data.get('troponin', 0) > 1.0:
            risk_score = min(risk_score + 10, 100)
        if data.get('ejectionFraction', 60) < 35:
            risk_score = min(risk_score + 10, 100)
        if data.get('age', 0) > 70:
            risk_score = min(risk_score + 5, 100)
        
        return risk_score
    
    def _get_top_factors(self, data: dict, importances: np.ndarray) -> list:
        """Get top 3 risk factors based on feature importance and values"""
        factors = []
        
        # Check each parameter (required fields)
        if data.get('age', 0) > 65:
            factors.append(("Advanced age", importances[0] * 100))
        if data.get('bp', 0) > 140:
            factors.append(("Hypertension", importances[1] * 100))
        if data.get('cholesterol', 0) > 200:
            factors.append(("High cholesterol", importances[2] * 100))
        if data.get('glucose', 0) > 125:
            factors.append(("Diabetes/Prediabetes", importances[3] * 100))
        if data.get('troponin', 0) > 0.1:
            factors.append(("Elevated troponin", importances[6] * 100))
        if data.get('ejectionFraction', 60) < 50:
            factors.append(("Reduced ejection fraction", importances[7] * 100))
        if data.get('stDepression', 0) > 1.0:
            factors.append(("ST depression", importances[5] * 100))
        if data.get('creatinine', 1.0) > 1.3:
            factors.append(("Kidney impairment", importances[8] * 100))
        if data.get('bmi', 25) > 30:
            factors.append(("Obesity", importances[9] * 100))
        
        # Check optional disease screening parameters
        if data.get('hba1c') is not None and data.get('hba1c', 0) >= 6.5:
            factors.append(("High HbA1c (Diabetes)", 18))
        if data.get('gfr') is not None and data.get('gfr', 100) < 60:
            factors.append(("Low GFR (Kidney disease)", 15))
        if data.get('protein_urine') is not None and data.get('protein_urine', 0) > 30:
            factors.append(("Proteinuria (Kidney damage)", 12))
        if data.get('alt') is not None and data.get('alt', 0) > 56:
            factors.append(("Elevated ALT (Liver stress)", 10))
        if data.get('ast') is not None and data.get('ast', 0) > 40:
            factors.append(("Elevated AST (Liver damage)", 10))
        if data.get('bilirubin') is not None and data.get('bilirubin', 0) > 1.2:
            factors.append(("High bilirubin (Liver dysfunction)", 8))
        if data.get('albumin') is not None and data.get('albumin', 4.0) < 3.5:
            factors.append(("Low albumin (Malnutrition)", 8))
        if data.get('platelet_count') is not None and data.get('platelet_count', 250) < 150:
            factors.append(("Low platelets (Bleeding risk)", 8))
        if data.get('systolic_bp') is not None and data.get('systolic_bp', 0) > 140:
            factors.append(("High systolic BP", 12))
        if data.get('diastolic_bp') is not None and data.get('diastolic_bp', 0) > 90:
            factors.append(("High diastolic BP", 10))
        
        # Sort by importance and get top 3
        factors.sort(key=lambda x: x[1], reverse=True)
        top_3 = [f[0] for f in factors[:3]]
        
        # If less than 3 factors, add generic ones
        if len(top_3) < 3:
            generic = ["Age", "Blood Pressure", "Cholesterol"]
            for g in generic:
                if g not in top_3:
                    top_3.append(g)
                if len(top_3) >= 3:
                    break
        
        return top_3[:3]
    
    def _get_recommendation(self, category: str, data: dict) -> str:
        """Generate personalized recommendation"""
        if category == "Low":
            return "Continue healthy lifestyle. Regular check-ups recommended. Maintain current health habits."
        elif category == "Moderate":
            return "Consult cardiologist for evaluation. Lifestyle modifications and possible medication needed. Monitor risk factors closely."
        else:  # High
            return "Urgent cardiology consultation required. Comprehensive cardiac workup and treatment plan needed. Immediate medical attention recommended."
    
    def _calculate_disease_risks(self, data: dict, base_risk: float) -> dict:
        """Calculate specific disease risks based on patient parameters"""
        
        # Cardiac Risk (based on cardiac markers)
        cardiac_risk = base_risk * 0.85
        if data.get('troponin', 0) > 0.5:
            cardiac_risk = min(cardiac_risk + 15, 100)
        if data.get('ejectionFraction', 60) < 40:
            cardiac_risk = min(cardiac_risk + 15, 100)
        if data.get('stDepression', 0) > 2.0:
            cardiac_risk = min(cardiac_risk + 10, 100)
        
        # Liver Disease Risk (based on liver markers)
        liver_risk = base_risk * 0.3  # Start lower
        if data.get('alt') is not None and data.get('alt', 0) > 56:
            liver_risk = min(liver_risk + 25, 100)
        if data.get('ast') is not None and data.get('ast', 0) > 40:
            liver_risk = min(liver_risk + 20, 100)
        if data.get('bilirubin') is not None and data.get('bilirubin', 0) > 1.2:
            liver_risk = min(liver_risk + 15, 100)
        if data.get('albumin') is not None and data.get('albumin', 4.0) < 3.5:
            liver_risk = min(liver_risk + 10, 100)
        
        # Kidney Disease Risk (based on kidney markers)
        kidney_risk = base_risk * 0.4  # Start moderate
        if data.get('creatinine', 1.0) > 2.0:
            kidney_risk = min(kidney_risk + 30, 100)
        elif data.get('creatinine', 1.0) > 1.5:
            kidney_risk = min(kidney_risk + 20, 100)
        if data.get('gfr') is not None and data.get('gfr', 100) < 60:
            kidney_risk = min(kidney_risk + 25, 100)
        if data.get('protein_urine') is not None and data.get('protein_urine', 0) > 30:
            kidney_risk = min(kidney_risk + 20, 100)
        
        # Hypertension Risk (based on BP markers)
        hypertension_risk = 0
        bp = data.get('bp', 0)
        if bp > 180:
            hypertension_risk = 95
        elif bp > 160:
            hypertension_risk = 85
        elif bp > 140:
            hypertension_risk = 70
        elif bp > 130:
            hypertension_risk = 50
        elif bp > 120:
            hypertension_risk = 30
        else:
            hypertension_risk = 10
        
        # Add systolic/diastolic if provided
        if data.get('systolic_bp') is not None and data.get('systolic_bp', 0) > 140:
            hypertension_risk = min(hypertension_risk + 15, 100)
        if data.get('diastolic_bp') is not None and data.get('diastolic_bp', 0) > 90:
            hypertension_risk = min(hypertension_risk + 10, 100)
        
        return {
            "Cardiac Risk": round(min(cardiac_risk, 100), 1),
            "Liver Disease Risk": round(min(liver_risk, 100), 1),
            "Kidney Disease Risk": round(min(kidney_risk, 100), 1),
            "Hypertension": round(min(hypertension_risk, 100), 1)
        }


# Global model instance
_model_instance = None

def get_model():
    """Get or create the global model instance"""
    global _model_instance
    if _model_instance is None:
        print("🔄 Initializing ML model...")
        _model_instance = CardiacRiskModel()
    return _model_instance


def predict_risk(patient_data: dict) -> dict:
    """
    Main prediction function
    """
    model = get_model()
    return model.predict(patient_data)
