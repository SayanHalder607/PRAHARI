"""
Unit tests for PRAHARI PSI Engine
"""

import pytest
import numpy as np
from backend.psi_engine import PSIEngine
from backend.simulation import SensorSimulator

class TestPSIEngine:
    
    def setup_method(self):
        self.psi_engine = PSIEngine()
        self.simulator = SensorSimulator()
        
    def test_normal_scenario_psi(self):
        """Test that normal scenario produces low PSI"""
        reading = self.simulator.generate_reading("normal")
        phys_data = {
            "heart_rate": reading["heart_rate"],
            "hrv": reading["hrv"],
            "eda": reading["eda"],
            "spo2": reading["spo2"]
        }
        sleep_data = {
            "sleep_duration": 7.5,
            "sleep_efficiency": 90,
            "sleep_debt": 0
        }
        workload_data = {
            "duty_hours": 8,
            "consecutive_days": 1,
            "operational_intensity": 3,
            "night_shift": False,
            "time_since_rest": 2
        }
        psych_data = {
            "perceived_stress": 2,
            "sleep_quality": 8,
            "fatigue_level": 2,
            "emotional_state": 8,
            "workload_perception": 3,
            "recovery_level": 8,
            "willingness_to_talk": 7
        }
        
        result = self.psi_engine.calculate_psi(
            physiological_data=phys_data,
            sleep_data=sleep_data,
            facial_data=None,
            workload_data=workload_data,
            psychometric_data=psych_data,
            previous_psi_values=[],
            personal_baselines={
                "baseline_hr": 72,
                "baseline_hrv": 55,
                "baseline_sleep_hours": 7.5
            }
        )
        
        assert result["psi_score"] < 30
        assert result["risk_tier"] in ["self_awareness", "personnel_wellness"]
        
    def test_high_stress_scenario_psi(self):
        """Test that high stress scenario produces elevated PSI"""
        reading = self.simulator.generate_reading("high_stress")
        phys_data = {
            "heart_rate": reading["heart_rate"],
            "hrv": reading["hrv"],
            "eda": reading["eda"],
            "spo2": reading["spo2"]
        }
        sleep_data = {
            "sleep_duration": 5.0,
            "sleep_efficiency": 70,
            "sleep_debt": 8
        }
        workload_data = {
            "duty_hours": 14,
            "consecutive_days": 5,
            "operational_intensity": 8,
            "night_shift": True,
            "time_since_rest": 6
        }
        psych_data = {
            "perceived_stress": 8,
            "sleep_quality": 2,
            "fatigue_level": 7,
            "emotional_state": 3,
            "workload_perception": 8,
            "recovery_level": 3,
            "willingness_to_talk": 3
        }
        
        result = self.psi_engine.calculate_psi(
            physiological_data=phys_data,
            sleep_data=sleep_data,
            facial_data={"blink_variability": 0.7, "facial_tension": 0.6, 
                        "expression_variability": 0.2, "head_movement": 0.5},
            workload_data=workload_data,
            psychometric_data=psych_data,
            previous_psi_values=[30, 35, 40, 45, 50],
            personal_baselines={
                "baseline_hr": 72,
                "baseline_hrv": 55,
                "baseline_sleep_hours": 7.5
            }
        )
        
        assert result["psi_score"] > 60
        assert result["risk_tier"] in ["welfare_officer", "urgent_human_review"]
        
    def test_physical_exertion_not_classified_as_stress(self):
        """Test that physical exertion is distinguished from psychological stress"""
        reading = self.simulator.generate_reading("physical_exertion")
        phys_data = {
            "heart_rate": reading["heart_rate"],
            "hrv": reading["hrv"],
            "eda": reading["eda"],
            "spo2": reading["spo2"]
        }
        
        # Normal sleep and workload for physical exertion scenario
        sleep_data = {
            "sleep_duration": 7.5,
            "sleep_efficiency": 88,
            "sleep_debt": 0
        }
        workload_data = {
            "duty_hours": 8,
            "consecutive_days": 2,
            "operational_intensity": 4,
            "night_shift": False,
            "time_since_rest": 2
        }
        psych_data = {
            "perceived_stress": 3,
            "sleep_quality": 7,
            "fatigue_level": 4,
            "emotional_state": 7,
            "workload_perception": 4,
            "recovery_level": 6,
            "willingness_to_talk": 6
        }
        
        result = self.psi_engine.calculate_psi(
            physiological_data=phys_data,
            sleep_data=sleep_data,
            facial_data=None,
            workload_data=workload_data,
            psychometric_data=psych_data,
            previous_psi_values=[],
            personal_baselines={
                "baseline_hr": 72,
                "baseline_hrv": 55,
                "baseline_sleep_hours": 7.5
            }
        )
        
        # Physical exertion should not produce extreme PSI values
        assert result["psi_score"] < 50