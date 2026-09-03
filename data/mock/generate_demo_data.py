"""
PRAHARI Demo Data Generator
Creates realistic mock data for hackathon demonstration
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List
import json
import random

class DemoDataGenerator:
    """
    Generates comprehensive mock dataset for PRAHARI demo
    """
    
    def __init__(self, num_personnel: int = 100, days_history: int = 30):
        self.num_personnel = num_personnel
        self.days_history = days_history
        self.scenarios = ["normal", "fatigue", "high_stress", "recovery", "physical_exertion"]
        
    def generate_personnel_profiles(self) -> pd.DataFrame:
        """Generate personnel profiles"""
        profiles = []
        ranks = ["Constable", "Head Constable", "Sub-Inspector", "Inspector", "Deputy Superintendent"]
        units = ["Alpha Company", "Bravo Company", "Charlie Company", "Delta Company", "Echo Company"]
        
        for i in range(self.num_personnel):
            profile = {
                "personnel_id": f"PRAH-{1000 + i}",
                "name": f"Personnel {1000 + i}",
                "rank": random.choice(ranks),
                "unit": random.choice(units),
                "age": random.randint(25, 50),
                "years_of_service": random.randint(2, 25),
                "baseline_hr": random.uniform(65, 78),
                "baseline_hrv": random.uniform(45, 65),
                "baseline_sleep_hours": random.uniform(6.5, 8.0),
                "deployment_type": random.choice(["Urban", "Rural", "Border", "High-Altitude"])
            }
            profiles.append(profile)
            
        return pd.DataFrame(profiles)
    
    def generate_wearable_data(self, personnel_id: str, days: int) -> pd.DataFrame:
        """Generate wearable sensor data"""
        readings = []
        start_time = datetime.utcnow() - timedelta(days=days)
        
        # Mix of scenarios over time
        for day in range(days):
            for hour in range(24):
                # Determine scenario based on time and random factors
                scenario = self._determine_scenario(day, hour)
                
                for minute in range(0, 60, 5):
                    reading = self._generate_reading(scenario)
                    reading["personnel_id"] = personnel_id
                    reading["timestamp"] = (start_time + timedelta(days=day, hours=hour, minutes=minute)).isoformat()
                    readings.append(reading)
                    
        return pd.DataFrame(readings)
    
    def _determine_scenario(self, day: int, hour: int) -> str:
        """Determine realistic scenario based on time patterns"""
        # Night hours often have sleep
        if 23 <= hour <= 4:
            return "recovery"
            
        # Random scenario assignment with realistic distribution
        rand = random.random()
        if day % 7 == 5:  # Friday evening
            if rand < 0.3:
                return "high_stress"
            elif rand < 0.5:
                return "fatigue"
        
        if rand < 0.6:
            return "normal"
        elif rand < 0.75:
            return "fatigue"
        elif rand < 0.85:
            return "high_stress"
        elif rand < 0.95:
            return "physical_exertion"
        else:
            return "recovery"
    
    def _generate_reading(self, scenario: str) -> Dict:
        """Generate sensor reading for scenario"""
        base_hr = 72
        base_hrv = 55
        
        scenarios = {
            "normal": {
                "hr": np.random.normal(base_hr, 3),
                "hrv": np.random.normal(base_hrv, 4),
                "spo2": np.random.normal(97.5, 0.5),
                "eda": np.random.normal(2.5, 0.5),
                "activity": np.random.uniform(0.1, 0.3)
            },
            "fatigue": {
                "hr": np.random.normal(base_hr + 8, 4),
                "hrv": np.random.normal(base_hrv - 15, 6),
                "spo2": np.random.normal(96.5, 0.8),
                "eda": np.random.normal(3.5, 0.7),
                "activity": np.random.uniform(0.2, 0.4)
            },
            "high_stress": {
                "hr": np.random.normal(base_hr + 15, 5),
                "hrv": np.random.normal(base_hrv - 25, 5),
                "spo2": np.random.normal(97, 0.7),
                "eda": np.random.normal(5.5, 1.0),
                "activity": np.random.uniform(0.3, 0.5)
            },
            "recovery": {
                "hr": np.random.normal(base_hr - 3, 2),
                "hrv": np.random.normal(base_hrv + 15, 4),
                "spo2": np.random.normal(98, 0.4),
                "eda": np.random.normal(1.8, 0.3),
                "activity": np.random.uniform(0.05, 0.15)
            },
            "physical_exertion": {
                "hr": np.random.normal(base_hr + 30, 8),
                "hrv": np.random.normal(base_hrv + 10, 6),
                "spo2": np.random.normal(97, 0.5),
                "eda": np.random.normal(4.5, 0.8),
                "activity": np.random.uniform(0.7, 0.95)
            }
        }
        
        data = scenarios[scenario]
        return {
            "heart_rate": round(data["hr"], 1),
            "hrv": round(data["hrv"], 1),
            "spo2": round(data["spo2"], 1),
            "eda": round(data["eda"], 2),
            "skin_temperature": round(np.random.normal(36.6, 0.3), 1),
            "activity_level": round(data["activity"], 2),
            "step_count": np.random.randint(0, 100),
            "scenario": scenario
        }
    
    def generate_dataset(self) -> Dict[str, pd.DataFrame]:
        """Generate complete dataset"""
        print(f"Generating demo dataset for {self.num_personnel} personnel over {self.days_history} days...")
        
        profiles = self.generate_personnel_profiles()
        all_readings = []
        
        for i, profile in profiles.iterrows():
            personnel_id = profile["personnel_id"]
            readings = self.generate_wearable_data(personnel_id, self.days_history)
            all_readings.append(readings)
            
            if (i + 1) % 10 == 0:
                print(f"  Generated data for {i + 1} personnel...")
        
        wearable_data = pd.concat(all_readings, ignore_index=True)
        
        return {
            "profiles": profiles,
            "wearable_data": wearable_data
        }
    
    def save_dataset(self, output_dir: str = "./data/mock"):
        """Save generated dataset to files"""
        dataset = self.generate_dataset()
        
        # Save as CSV and JSON
        dataset["profiles"].to_csv(f"{output_dir}/profiles.csv", index=False)
        dataset["wearable_data"].to_csv(f"{output_dir}/wearable_data.csv", index=False)
        
        # Save sample JSON for API testing
        sample_data = {
            "personnel": dataset["profiles"].head(5).to_dict('records'),
            "readings": dataset["wearable_data"].head(100).to_dict('records')
        }
        
        with open(f"{output_dir}/sample_data.json", 'w') as f:
            json.dump(sample_data, f, indent=2)
            
        print(f"Dataset saved to {output_dir}")
        print(f"  - {len(dataset['profiles'])} personnel profiles")
        print(f"  - {len(dataset['wearable_data'])} wearable readings")

if __name__ == "__main__":
    generator = DemoDataGenerator(num_personnel=100, days_history=30)
    generator.save_dataset()