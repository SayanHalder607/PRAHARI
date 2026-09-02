"""
PRAHARI Personnel Stress Index (PSI) Engine
Multimodal fusion with configurable weights and explainable AI
"""

import numpy as np
from typing import Dict, List, Optional, Tuple


class PSIEngine:
    """
    Multimodal Personnel Stress Index calculation engine
    """

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or {
            "physiological": 0.30,
            "sleep_fatigue": 0.20,
            "facial_behavioral": 0.15,
            "operational_load": 0.15,
            "psychometric": 0.15,
            "historical_trend": 0.05,
        }

    def calculate_physiological_score(
        self,
        heart_rate: float,
        hrv: float,
        eda: float,
        baseline_hr: float,
        baseline_hrv: float,
        spo2: float = 97.0,
        skin_temp: float = 36.5,
    ) -> Tuple[float, Dict]:
        factors = {}

        hr_deviation = (heart_rate - baseline_hr) / baseline_hr
        if heart_rate > baseline_hr * 1.15:
            hr_score = min(100, 50 + (hr_deviation - 0.15) * 200)
            factors["HR elevated above personal baseline"] = round(hr_deviation * 100, 1)
        elif heart_rate > baseline_hr * 1.05:
            hr_score = 30 + (hr_deviation - 0.05) * 200
            factors["HR slightly above personal baseline"] = round(hr_deviation * 100, 1)
        else:
            hr_score = max(0, hr_deviation * 200)

        hrv_ratio = hrv / baseline_hrv if baseline_hrv > 0 else 1.0
        if hrv_ratio < 0.7:
            hrv_score = min(100, 60 + (0.7 - hrv_ratio) * 150)
            factors["HRV significantly below baseline"] = round((1 - hrv_ratio) * 100, 1)
        elif hrv_ratio < 0.9:
            hrv_score = 30 + (0.9 - hrv_ratio) * 150
            factors["HRV moderately below baseline"] = round((1 - hrv_ratio) * 100, 1)
        else:
            hrv_score = max(0, (1 - hrv_ratio) * 100)

        eda_score = min(100, max(0, (eda - 2.0) * 25))
        if eda_score > 40:
            factors["Elevated electrodermal activity"] = round(eda_score, 1)

        spo2_score = max(0, (98 - spo2) * 15)

        phys_score = 0.25 * hr_score + 0.35 * hrv_score + 0.25 * eda_score + 0.15 * spo2_score
        return min(100, max(0, phys_score)), factors

    def calculate_sleep_score(
        self,
        sleep_duration: float,
        sleep_efficiency: float,
        baseline_sleep: float,
        sleep_debt: float,
    ) -> Tuple[float, Dict]:
        factors = {}

        sleep_deviation = (baseline_sleep - sleep_duration) / baseline_sleep
        if sleep_duration < baseline_sleep * 0.7:
            duration_score = min(100, 60 + sleep_deviation * 200)
            factors["Sleep duration severely below baseline"] = round(sleep_deviation * 100, 1)
        elif sleep_duration < baseline_sleep * 0.9:
            duration_score = 30 + (sleep_deviation - 0.1) * 300
            factors["Sleep duration below baseline"] = round(sleep_deviation * 100, 1)
        else:
            duration_score = max(0, sleep_deviation * 150)

        efficiency_score = max(0, (90 - sleep_efficiency) * 3)
        if efficiency_score > 30:
            factors["Poor sleep efficiency"] = round(efficiency_score, 1)

        debt_score = min(100, max(0, sleep_debt * 20))
        if debt_score > 40:
            factors["Accumulated sleep debt"] = round(sleep_debt, 1)

        sleep_score = 0.4 * duration_score + 0.3 * efficiency_score + 0.3 * debt_score
        return min(100, max(0, sleep_score)), factors

    def calculate_facial_score(self, facial_analysis: Dict) -> Tuple[float, Dict]:
        factors = {}
        score = 0

        blink_variability = facial_analysis.get("blink_variability", 0.3)
        if blink_variability > 0.6:
            score += 25
            factors["Increased blink variability"] = round(blink_variability * 100, 1)
        elif blink_variability > 0.4:
            score += 15
            factors["Moderate blink variability"] = round(blink_variability * 100, 1)

        facial_tension = facial_analysis.get("facial_tension", 0.3)
        if facial_tension > 0.6:
            score += 30
            factors["Elevated facial tension features"] = round(facial_tension * 100, 1)
        elif facial_tension > 0.4:
            score += 20
            factors["Moderate facial tension"] = round(facial_tension * 100, 1)

        expression_variability = facial_analysis.get("expression_variability", 0.5)
        if expression_variability < 0.3:
            score += 20
            factors["Reduced expression variability"] = round((1 - expression_variability) * 100, 1)

        head_movement = facial_analysis.get("head_movement", 0.3)
        if head_movement > 0.6:
            score += 15
            factors["Increased head movement"] = round(head_movement * 100, 1)

        au_intensity = facial_analysis.get("au_intensity", 0.3)
        if au_intensity > 0.5:
            score += 10
            factors["Elevated facial action unit activity"] = round(au_intensity * 100, 1)

        return min(100, max(0, score)), factors

    def calculate_workload_score(self, duty_record: Dict) -> Tuple[float, Dict]:
        factors = {}
        score = 0

        duty_hours = duty_record.get("duty_hours", 8)
        if duty_hours > 12:
            score += 35
            factors["Extended duty hours"] = round(duty_hours, 1)
        elif duty_hours > 10:
            score += 20
            factors["Long duty hours"] = round(duty_hours, 1)

        consecutive_days = duty_record.get("consecutive_days", 1)
        if consecutive_days > 7:
            score += 30
            factors["Extended consecutive duty days"] = consecutive_days
        elif consecutive_days > 4:
            score += 15
            factors["Multiple consecutive duty days"] = consecutive_days

        intensity = duty_record.get("operational_intensity", 3)
        if intensity >= 8:
            score += 35
            factors["High operational intensity"] = intensity
        elif intensity >= 6:
            score += 20
            factors["Elevated operational intensity"] = intensity

        if duty_record.get("night_shift", False):
            score += 10
            factors["Night shift duty"] = 1

        time_since_rest = duty_record.get("time_since_rest", 4)
        if time_since_rest > 8:
            score += 15
            factors["Prolonged time since last rest"] = round(time_since_rest, 1)

        return min(100, max(0, score)), factors

    def calculate_psychometric_score(self, checkin: Dict) -> Tuple[float, Dict]:
        factors = {}
        score = 0

        perceived_stress = checkin.get("perceived_stress", 3)
        score += perceived_stress * 8
        if perceived_stress >= 7:
            factors["High perceived stress"] = perceived_stress

        sleep_quality = checkin.get("sleep_quality", 5)
        score += (10 - sleep_quality) * 6
        if sleep_quality <= 3:
            factors["Poor reported sleep quality"] = sleep_quality

        fatigue = checkin.get("fatigue_level", 3)
        score += fatigue * 8
        if fatigue >= 7:
            factors["High fatigue level reported"] = fatigue

        workload = checkin.get("workload_perception", 3)
        score += workload * 6
        if workload >= 8:
            factors["Heavy perceived workload"] = workload

        recovery = checkin.get("recovery_level", 7)
        score += (10 - recovery) * 5

        emotional_state = checkin.get("emotional_state", 5)
        if emotional_state <= 3:
            score += 15
            factors["Low emotional state reported"] = emotional_state

        willingness = checkin.get("willingness_to_talk", 5)
        if willingness <= 2:
            score += 10
            factors["Low willingness to seek support"] = willingness

        return min(100, max(0, score)), factors

    def calculate_historical_trend_score(
        self, current_psi: float, previous_psi_values: List[float]
    ) -> Tuple[float, Dict]:
        factors = {}
        if not previous_psi_values:
            return 0, factors

        avg_previous = np.mean(previous_psi_values)
        if current_psi > avg_previous * 1.3:
            trend_score = min(100, (current_psi - avg_previous) * 3)
            factors["PSI trending above personal historical average"] = round(
                (current_psi - avg_previous), 1
            )
        else:
            trend_score = max(0, (current_psi - avg_previous) * 1.5)

        return min(100, max(0, trend_score)), factors

    def calculate_psi(
        self,
        physiological_data: Dict,
        sleep_data: Dict,
        facial_data: Optional[Dict],
        workload_data: Dict,
        psychometric_data: Dict,
        previous_psi_values: List[float],
        personal_baselines: Dict,
    ) -> Dict:
        phys_score, phys_factors = self.calculate_physiological_score(
            heart_rate=physiological_data["heart_rate"],
            hrv=physiological_data["hrv"],
            eda=physiological_data["eda"],
            baseline_hr=personal_baselines["baseline_hr"],
            baseline_hrv=personal_baselines["baseline_hrv"],
            spo2=physiological_data.get("spo2", 97.0),
        )

        sleep_score, sleep_factors = self.calculate_sleep_score(
            sleep_duration=sleep_data["sleep_duration"],
            sleep_efficiency=sleep_data["sleep_efficiency"],
            baseline_sleep=personal_baselines["baseline_sleep_hours"],
            sleep_debt=sleep_data.get("sleep_debt", 0),
        )

        facial_score = 0
        facial_factors = {}
        if facial_data:
            facial_score, facial_factors = self.calculate_facial_score(facial_data)

        workload_score, workload_factors = self.calculate_workload_score(workload_data)
        psych_score, psych_factors = self.calculate_psychometric_score(psychometric_data)

        initial_psi = (
            self.weights["physiological"] * phys_score
            + self.weights["sleep_fatigue"] * sleep_score
            + self.weights["facial_behavioral"] * facial_score
            + self.weights["operational_load"] * workload_score
            + self.weights["psychometric"] * psych_score
        )

        hist_score, hist_factors = self.calculate_historical_trend_score(
            initial_psi, previous_psi_values
        )

        final_psi = initial_psi + self.weights["historical_trend"] * hist_score
        final_psi = min(100, max(0, final_psi))

        if final_psi >= 81:
            risk_tier = "urgent_human_review"
            tier_label = "Critical Welfare Attention"
        elif final_psi >= 61:
            risk_tier = "welfare_officer"
            tier_label = "High Stress"
        elif final_psi >= 41:
            risk_tier = "personnel_wellness"
            tier_label = "Moderate Stress"
        elif final_psi >= 21:
            risk_tier = "personnel_wellness"
            tier_label = "Mild Stress"
        else:
            risk_tier = "self_awareness"
            tier_label = "Normal / Stable"

        if previous_psi_values:
            recent_trend = final_psi - np.mean(previous_psi_values[-3:])
            if recent_trend > 10:
                trend = "Increasing rapidly"
            elif recent_trend > 3:
                trend = "Increasing"
            elif recent_trend < -10:
                trend = "Decreasing rapidly"
            elif recent_trend < -3:
                trend = "Decreasing"
            else:
                trend = "Stable"
        else:
            trend = "Insufficient data"

        all_factors = {
            **phys_factors,
            **sleep_factors,
            **facial_factors,
            **workload_factors,
            **psych_factors,
            **hist_factors,
        }
        sorted_factors = dict(sorted(all_factors.items(), key=lambda x: x[1], reverse=True)[:8])

        modality_count = 5
        confidence = 0.5 + 0.1 * modality_count
        if facial_data:
            confidence += 0.1
        if psychometric_data:
            confidence += 0.1
        confidence = min(0.95, max(0.6, confidence))

        return {
            "psi_score": round(final_psi, 1),
            "risk_tier": risk_tier,
            "tier_label": tier_label,
            "confidence": round(confidence, 2),
            "trend": trend,
            "contributing_factors": sorted_factors,
            "modality_scores": {
                "physiological": round(phys_score, 1),
                "sleep_fatigue": round(sleep_score, 1),
                "facial_behavioral": round(facial_score, 1),
                "operational_load": round(workload_score, 1),
                "psychometric": round(psych_score, 1),
                "historical_trend": round(hist_score, 1),
            },
        }