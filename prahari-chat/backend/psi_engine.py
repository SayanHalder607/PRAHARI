"""
PRAHARI Chat - Personnel Stress Index (PSI) Conversational Engine
Calculates real-time behavioral and conversational stress indicators for tactical personnel.
"""

from typing import Dict, List, Optional
import re
import random

class ConversationalPSIEngine:
    def __init__(self):
        # Stress keywords and weightings
        self.high_stress_keywords = [
            "exhausted", "can't sleep", "cant sleep", "insomnia", "overwhelmed",
            "hopeless", "panic", "dread", "anxious", "anxiety", "breaking point",
            "shaking", "burnout", "depressed", "rage", "snapped", "nightmare",
            "flashback", "chest pain", "drowning", "suffocating", "give up"
        ]
        self.moderate_stress_keywords = [
            "tired", "headache", "stress", "stressed", "tense", "irritable",
            "frustrated", "noisy", "heavy duty", "long patrol", "fatigued",
            "on edge", "conflict", "isolated", "lonely", "homesick", "pressure"
        ]
        self.positive_keywords = [
            "fine", "good", "better", "rested", "calm", "steady", "relaxed",
            "manageable", "supported", "refreshed", "peaceful"
        ]

    def analyze_text(self, text: str) -> Dict[str, any]:
        """Analyzes text message for linguistic stress cues."""
        text_lower = text.lower()
        
        high_matches = [kw for kw in self.high_stress_keywords if re.search(r'\b' + re.escape(kw) + r'\b', text_lower)]
        mod_matches = [kw for kw in self.moderate_stress_keywords if re.search(r'\b' + re.escape(kw) + r'\b', text_lower)]
        pos_matches = [kw for kw in self.positive_keywords if re.search(r'\b' + re.escape(kw) + r'\b', text_lower)]

        raw_score = 30.0  # Baseline neutral conversational score
        raw_score += len(high_matches) * 22.0
        raw_score += len(mod_matches) * 10.0
        raw_score -= len(pos_matches) * 12.0

        if re.search(r'[!?]{2,}', text):
            raw_score += 8.0
        if len(text) > 10 and sum(1 for c in text if c.isupper()) / len(text) > 0.4:
            raw_score += 10.0

        clamped_score = max(5.0, min(95.0, raw_score))
        
        factors = []
        if high_matches:
            factors.append(f"Severe distress expressions ({', '.join(high_matches[:3])})")
        if mod_matches:
            factors.append(f"Operational strain cues ({', '.join(mod_matches[:3])})")
        if pos_matches:
            factors.append("Positive/grounded language detected")

        return {
            "score": round(clamped_score, 1),
            "high_matches": high_matches,
            "moderate_matches": mod_matches,
            "factors": factors
        }

    def compute_composite_psi(
        self,
        text: str,
        sleep_hours: Optional[float] = None,
        fatigue_level: Optional[int] = None,
        duty_hours: Optional[float] = None,
        reported_mood: Optional[int] = None
    ) -> Dict[str, any]:
        """Calculates multi-modal PSI composite score."""
        text_analysis = self.analyze_text(text)
        text_score = text_analysis["score"]

        sleep_score = 25.0
        factors = list(text_analysis["factors"])
        
        if sleep_hours is not None:
            if sleep_hours < 4.0:
                sleep_score = 90.0
                factors.append(f"Critical sleep deprivation ({sleep_hours} hrs reported)")
            elif sleep_hours < 6.0:
                sleep_score = 65.0
                factors.append(f"Sub-optimal recovery sleep ({sleep_hours} hrs)")
            elif sleep_hours <= 8.5:
                sleep_score = 15.0
            else:
                sleep_score = 35.0

        fatigue_score = 30.0
        if fatigue_level is not None:
            fatigue_score = min(100.0, fatigue_level * 10.0)
            if fatigue_level >= 7:
                factors.append(f"High fatigue rating ({fatigue_level}/10)")

        duty_score = 30.0
        if duty_hours is not None:
            if duty_hours > 12.0:
                duty_score = 85.0
                factors.append(f"Extended duty shift ({duty_hours} hrs)")
            elif duty_hours > 8.0:
                duty_score = 55.0
            else:
                duty_score = 20.0

        composite_score = (
            text_score * 0.40 +
            sleep_score * 0.25 +
            fatigue_score * 0.20 +
            duty_score * 0.15
        )
        composite_score = round(max(5.0, min(98.0, composite_score)), 1)

        if composite_score < 35.0:
            risk_level = "Normal / Low Strain"
            color = "#10B981"
            recommendation = "Maintain routine operational tempo and baseline recovery rest."
        elif composite_score < 65.0:
            risk_level = "Moderate Strain"
            color = "#F59E0B"
            recommendation = "Engage in controlled breathing, hydration, and scheduled 20-min recuperation."
        elif composite_score < 85.0:
            risk_level = "High Strain"
            color = "#F97316"
            recommendation = "Mandatory break recommended. Practice 4-4-4-4 box breathing and notify welfare peer."
        else:
            risk_level = "Severe Fatigue / Stress"
            color = "#EF4444"
            recommendation = "Immediate rest protocol initiated. Recommend off-duty rest & peer counselor check-in."

        return {
            "psi_score": composite_score,
            "risk_level": risk_level,
            "status_color": color,
            "factors": factors,
            "recommendation": recommendation,
            "breakdown": {
                "conversational_sentiment": text_score,
                "sleep_fatigue": sleep_score,
                "operational_workload": duty_score
            }
        }

PSIEngine = ConversationalPSIEngine

def get_current_psi() -> Dict:
    """Return a simulated current PSI with factors and trend."""
    psi_score = random.uniform(25, 70)
    trend = random.choice(["Stable", "Increasing", "Decreasing"])
    factors = {
        "Sleep duration": round(random.uniform(5.0, 8.0), 1),
        "HRV": round(random.uniform(30, 60), 1),
        "EDA": round(random.uniform(2.0, 6.0), 2),
        "Workload": round(random.uniform(3, 9), 1)
    }
    return {
        "psi_score": round(psi_score, 1),
        "trend": trend,
        "factors": factors
    }