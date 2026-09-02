"""
PRAHARI Live Simulation Mode
Generates synthetic but realistic sensor data streams for demonstration
"""

import numpy as np
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random

class SensorSimulator:
    """
    Generates realistic wearable sensor data for demo scenarios
    """
    
    def __init__(self):
        self.scenarios = {
            "normal": self._normal_scenario,
            "fatigue": self._fatigue_scenario,
            "high_stress": self._high_stress_scenario,
            "recovery": self._recovery_scenario,
            "critical": self._critical_scenario,
            "physical_exertion": self._physical_exertion_scenario
        }
        
    def generate_reading(self, scenario: str, baseline_hr: float = 72.0, 
                        baseline_hrv: float = 55.0) -> Dict:
        """
        Generate a single sensor reading for the given scenario
        """
        if scenario not in self.scenarios:
            scenario = "normal"
            
        generator = self.scenarios[scenario]
        return generator(baseline_hr, baseline_hrv)
    
    def _normal_scenario(self, baseline_hr, baseline_hrv) -> Dict:
        """Normal healthy pattern"""
        return {
            "heart_rate": round(np.random.normal(baseline_hr, 3), 1),
            "hrv": round(np.random.normal(baseline_hrv, 4), 1),
            "spo2": round(np.random.normal(97.5, 0.5), 1),
            "eda": round(np.random.normal(2.5, 0.5), 2),
            "skin_temperature": round(np.random.normal(36.6, 0.2), 1),
            "accelerometer_x": round(np.random.normal(0, 0.05), 3),
            "accelerometer_y": round(np.random.normal(0, 0.05), 3),
            "accelerometer_z": round(np.random.normal(1, 0.05), 3),
            "activity_level": round(np.random.uniform(0.1, 0.3), 2),
            "step_count": np.random.randint(0, 20)
        }
    
    def _fatigue_scenario(self, baseline_hr, baseline_hrv) -> Dict:
        """Sleep-deprived fatigue pattern"""
        return {
            "heart_rate": round(np.random.normal(baseline_hr + 8, 4), 1),
            "hrv": round(np.random.normal(baseline_hrv - 15, 6), 1),
            "spo2": round(np.random.normal(96.5, 0.8), 1),
            "eda": round(np.random.normal(3.5, 0.7), 2),
            "skin_temperature": round(np.random.normal(36.4, 0.3), 1),
            "accelerometer_x": round(np.random.normal(0, 0.08), 3),
            "accelerometer_y": round(np.random.normal(0, 0.08), 3),
            "accelerometer_z": round(np.random.normal(0.98, 0.08), 3),
            "activity_level": round(np.random.uniform(0.2, 0.4), 2),
            "step_count": np.random.randint(10, 40)
        }
    
    def _high_stress_scenario(self, baseline_hr, baseline_hrv) -> Dict:
        """Psychological stress pattern"""
        return {
            "heart_rate": round(np.random.normal(baseline_hr + 15, 5), 1),
            "hrv": round(np.random.normal(baseline_hrv - 25, 5), 1),
            "spo2": round(np.random.normal(97, 0.7), 1),
            "eda": round(np.random.normal(5.5, 1.0), 2),
            "skin_temperature": round(np.random.normal(36.8, 0.3), 1),
            "accelerometer_x": round(np.random.normal(0, 0.1), 3),
            "accelerometer_y": round(np.random.normal(0, 0.1), 3),
            "accelerometer_z": round(np.random.normal(0.97, 0.1), 3),
            "activity_level": round(np.random.uniform(0.3, 0.5), 2),
            "step_count": np.random.randint(20, 50)
        }
    
    def _recovery_scenario(self, baseline_hr, baseline_hrv) -> Dict:
        """Recovery and relaxation pattern"""
        return {
            "heart_rate": round(np.random.normal(baseline_hr - 3, 2), 1),
            "hrv": round(np.random.normal(baseline_hrv + 15, 4), 1),
            "spo2": round(np.random.normal(98, 0.4), 1),
            "eda": round(np.random.normal(1.8, 0.3), 2),
            "skin_temperature": round(np.random.normal(36.7, 0.2), 1),
            "accelerometer_x": round(np.random.normal(0, 0.03), 3),
            "accelerometer_y": round(np.random.normal(0, 0.03), 3),
            "accelerometer_z": round(np.random.normal(1, 0.03), 3),
            "activity_level": round(np.random.uniform(0.05, 0.15), 2),
            "step_count": np.random.randint(0, 10)
        }
    
    def _critical_scenario(self, baseline_hr, baseline_hrv) -> Dict:
        """Critical stress pattern requiring attention"""
        return {
            "heart_rate": round(np.random.normal(baseline_hr + 25, 6), 1),
            "hrv": round(np.random.normal(baseline_hrv - 35, 5), 1),
            "spo2": round(np.random.normal(95.5, 1.0), 1),
            "eda": round(np.random.normal(7.5, 1.5), 2),
            "skin_temperature": round(np.random.normal(37.1, 0.4), 1),
            "accelerometer_x": round(np.random.normal(0, 0.15), 3),
            "accelerometer_y": round(np.random.normal(0, 0.15), 3),
            "accelerometer_z": round(np.random.normal(0.95, 0.15), 3),
            "activity_level": round(np.random.uniform(0.4, 0.7), 2),
            "step_count": np.random.randint(30, 60)
        }
    
    def _physical_exertion_scenario(self, baseline_hr, baseline_hrv) -> Dict:
        """Physical exertion that should NOT be classified as psychological stress"""
        return {
            "heart_rate": round(np.random.normal(baseline_hr + 30, 8), 1),
            "hrv": round(np.random.normal(baseline_hrv + 10, 6), 1),  # HRV may increase with exercise
            "spo2": round(np.random.normal(97, 0.5), 1),
            "eda": round(np.random.normal(4.5, 0.8), 2),  # Elevated but different pattern
            "skin_temperature": round(np.random.normal(37.2, 0.4), 1),
            "accelerometer_x": round(np.random.normal(0.5, 0.2), 3),
            "accelerometer_y": round(np.random.normal(0.4, 0.2), 3),
            "accelerometer_z": round(np.random.normal(0.8, 0.2), 3),
            "activity_level": round(np.random.uniform(0.7, 0.95), 2),
            "step_count": np.random.randint(60, 100)
        }
    
    def generate_sequence(self, scenario: str, duration_minutes: int = 30,
                         baseline_hr: float = 72.0, baseline_hrv: float = 55.0) -> List[Dict]:
        """
        Generate a sequence of readings over time
        """
        readings = []
        start_time = datetime.utcnow() - timedelta(minutes=duration_minutes)
        
        for i in range(duration_minutes):
            reading = self.generate_reading(scenario, baseline_hr, baseline_hrv)
            reading["timestamp"] = (start_time + timedelta(minutes=i)).isoformat()
            readings.append(reading)
            
        return readings