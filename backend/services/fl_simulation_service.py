"""
Federated Learning Simulation Service
Simulates realistic FL training with verified hospitals
"""
import random
import time
from datetime import datetime
from typing import List, Dict, Any

class FLSimulationService:
    def __init__(self):
        # Initialize with realistic starting metrics
        self.current_accuracy = 0.76 + random.uniform(0, 0.02)  # 76-78%
        self.current_loss = 0.48 + random.uniform(-0.03, 0.03)  # ~0.48
        self.current_f1_score = 0.74 + random.uniform(0, 0.02)  # 74-76%
        self.current_precision = 0.75 + random.uniform(0, 0.02)
        self.current_recall = 0.73 + random.uniform(0, 0.02)
        self.round_number = 0
        self.training_history = []
        self.total_samples_trained = 0
        
    def calculate_improvement(self, num_hospitals: int, round_num: int) -> Dict[str, float]:
        """
        Calculate realistic improvement based on FL theory
        More hospitals = better generalization = higher accuracy
        """
        # Base improvement factors
        hospital_factor = min(num_hospitals / 8.0, 1.2)  # Optimal at 8+ hospitals
        
        # Diminishing returns as model converges
        convergence_factor = 1.0 / (1.0 + 0.08 * round_num)
        
        # Add realistic noise (FL is non-deterministic)
        noise = random.uniform(-0.003, 0.005)
        
        # Calculate improvements
        accuracy_improvement = (0.015 * hospital_factor * convergence_factor) + noise
        loss_reduction = (0.02 * hospital_factor * convergence_factor) + random.uniform(-0.002, 0.002)
        
        # Ensure we don't exceed realistic limits
        accuracy_improvement = max(0.005, min(accuracy_improvement, 0.035))
        loss_reduction = max(0.005, min(loss_reduction, 0.04))
        
        return {
            "accuracy": accuracy_improvement,
            "loss": loss_reduction,
            "f1": accuracy_improvement * 0.95,
            "precision": accuracy_improvement * 0.92,
            "recall": accuracy_improvement * 0.98
        }
    
    def run_training_round(self, selected_hospitals: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Simulate one FL training round with selected hospitals
        Returns realistic metrics
        """
        self.round_number += 1
        num_hospitals = len(selected_hospitals)
        
        # Calculate improvements
        improvements = self.calculate_improvement(num_hospitals, self.round_number)
        
        # Update metrics with realistic caps
        self.current_accuracy = min(self.current_accuracy + improvements["accuracy"], 0.965)
        self.current_loss = max(self.current_loss - improvements["loss"], 0.045)
        self.current_f1_score = min(self.current_f1_score + improvements["f1"], 0.96)
        self.current_precision = min(self.current_precision + improvements["precision"], 0.97)
        self.current_recall = min(self.current_recall + improvements["recall"], 0.95)
        
        # Simulate data contribution from each hospital
        samples_per_hospital = random.randint(800, 1500)
        total_samples = num_hospitals * samples_per_hospital
        self.total_samples_trained += total_samples
        
        # Create training record
        training_record = {
            "round": self.round_number,
            "timestamp": datetime.now().isoformat(),
            "metrics": {
                "accuracy": round(self.current_accuracy, 4),
                "loss": round(self.current_loss, 4),
                "f1_score": round(self.current_f1_score, 4),
                "precision": round(self.current_precision, 4),
                "recall": round(self.current_recall, 4)
            },
            "improvements": {
                "accuracy": round(improvements["accuracy"], 4),
                "loss": round(improvements["loss"], 4),
                "f1_score": round(improvements["f1"], 4)
            },
            "participating_hospitals": num_hospitals,
            "hospital_names": [h["hospital_name"] for h in selected_hospitals],
            "hospital_locations": [f"{h.get('district', 'N/A')}, {h.get('state', 'N/A')}" for h in selected_hospitals],
            "samples_trained": total_samples,
            "total_samples": self.total_samples_trained,
            "training_time_seconds": round(random.uniform(15, 45), 1),
            "convergence_status": "converging" if self.current_accuracy < 0.94 else "near_optimal"
        }
        
        self.training_history.append(training_record)
        
        return training_record
    
    def get_current_metrics(self) -> Dict[str, Any]:
        """Get current model metrics"""
        return {
            "round": self.round_number,
            "accuracy": round(self.current_accuracy, 4),
            "loss": round(self.current_loss, 4),
            "f1_score": round(self.current_f1_score, 4),
            "precision": round(self.current_precision, 4),
            "recall": round(self.current_recall, 4),
            "total_samples_trained": self.total_samples_trained,
            "status": "ready" if self.round_number == 0 else "trained"
        }
    
    def get_training_history(self) -> List[Dict[str, Any]]:
        """Get complete training history"""
        return self.training_history
    
    def reset_simulation(self):
        """Reset to initial state"""
        self.__init__()


# Global FL service instance
fl_service = FLSimulationService()
