"""
ML Model for cardiac risk prediction with SHAP explainability.
"""
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import pickle
import os
from typing import Dict, Any, List
import shap


class CardiacRiskModel:
    """
    Logistic Regression model for cardiac risk prediction.
    Includes feature engineering and SHAP explainability.
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'age', 'bp', 'cholesterol', 'glucose', 'maxHr', 'stDepression',
            'troponin', 'ejectionFraction', 'creatinine', 'bmi'
        ]
        self.is_trained = False
        
    def train(self, X: pd.DataFrame, y: np.ndarray):
        """
        Train the logistic regression model.
        
        Args:
            X: Training features
            y: Training labels (0 = low risk, 1 = high risk)
        """
        # Scale features
        X_scaled = self.scaler.fit_transform(X[self.feature_names])
        
        # Train logistic regression
        self.model = LogisticRegression(
            C=0.1,
            max_iter=1000,
            random_state=42,
            class_weight='balanced'
        )
        self.model.fit(X_scaled, y)
        self.is_trained = True
        
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict risk probability.
        
        Args:
            X: Features DataFrame
            
        Returns:
            Array of probabilities for high risk class
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet")
            
        X_scaled = self.scaler.transform(X[self.feature_names])
        return self.model.predict_proba(X_scaled)[:, 1]
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get feature importance based on model coefficients.
        
        Returns:
            Dictionary mapping feature names to importance scores
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet")
            
        # Get absolute coefficients as importance
        importance = np.abs(self.model.coef_[0])
        
        # Normalize to sum to 1
        importance = importance / importance.sum()
        
        return dict(zip(self.feature_names, importance))
    
    def calculate_shap_values(self, X: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate SHAP values for explainability.
        
        Args:
            X: Features DataFrame
            
        Returns:
            Dictionary with SHAP values and feature contributions
        """
        if not self.is_trained:
            # Return mock SHAP values for demo
            return self._mock_shap_values(X)
        
        try:
            X_scaled = self.scaler.transform(X[self.feature_names])
            
            # Create SHAP explainer
            explainer = shap.LinearExplainer(self.model, X_scaled)
            shap_values = explainer.shap_values(X_scaled)
            
            # Get feature contributions for first prediction
            if len(shap_values.shape) > 1:
                contributions = shap_values[0]
            else:
                contributions = shap_values
                
            # Create feature contribution dict
            feature_contributions = []
            for i, feature in enumerate(self.feature_names):
                feature_contributions.append({
                    'feature': feature,
                    'value': float(contributions[i]),
                    'positive': contributions[i] > 0
                })
            
            # Sort by absolute contribution
            feature_contributions.sort(key=lambda x: abs(x['value']), reverse=True)
            
            return {
                'contributions': feature_contributions[:6],  # Top 6 features
                'base_value': float(explainer.expected_value) if hasattr(explainer, 'expected_value') else 0.5
            }
        except Exception as e:
            print(f"SHAP calculation error: {e}")
            return self._mock_shap_values(X)
    
    def _mock_shap_values(self, X: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate mock SHAP values based on feature values.
        Used when SHAP calculation fails or model not trained.
        """
        row = X.iloc[0] if isinstance(X, pd.DataFrame) else X
        
        contributions = []
        
        # Troponin - strongest predictor
        troponin_impact = 0.35 if row['troponin'] > 0.04 else -0.15
        contributions.append({
            'feature': 'Troponin',
            'value': troponin_impact,
            'positive': troponin_impact > 0
        })
        
        # Ejection Fraction
        ef_impact = 0.25 if row['ejectionFraction'] < 45 else -0.10
        contributions.append({
            'feature': 'Ejection Fraction',
            'value': ef_impact,
            'positive': ef_impact > 0
        })
        
        # ST Depression
        st_impact = 0.20 if row['stDepression'] > 1.5 else -0.05
        contributions.append({
            'feature': 'ST Depression',
            'value': st_impact,
            'positive': st_impact > 0
        })
        
        # Age
        age_impact = 0.15 if row['age'] > 65 else -0.08
        contributions.append({
            'feature': 'Age',
            'value': age_impact,
            'positive': age_impact > 0
        })
        
        # Creatinine
        creat_impact = 0.18 if row['creatinine'] > 1.3 else -0.05
        contributions.append({
            'feature': 'Creatinine',
            'value': creat_impact,
            'positive': creat_impact > 0
        })
        
        # Max HR (protective when high)
        hr_impact = -0.12 if row['maxHr'] > 140 else 0.08
        contributions.append({
            'feature': 'Max Heart Rate',
            'value': hr_impact,
            'positive': hr_impact > 0
        })
        
        return {
            'contributions': contributions,
            'base_value': 0.3
        }
    
    def save(self, model_path: str, scaler_path: str):
        """Save model and scaler to disk."""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")
            
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
        with open(scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
    
    def load(self, model_path: str, scaler_path: str):
        """Load model and scaler from disk."""
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            self.is_trained = True
            return True
        return False


# Global model instance
cardiac_model = CardiacRiskModel()
