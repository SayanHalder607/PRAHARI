"""
PRAHARI Pydantic Schemas
Request and response models for API validation
"""

from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class WellnessCheckInRequest(BaseModel):
    personnel_id: Optional[str] = None
    perceived_stress: int = 3
    sleep_quality: int = 5
    fatigue_level: int = 3
    emotional_state: int = 5
    workload_perception: int = 3
    recovery_level: int = 7
    willingness_to_talk: int = 5
    notes: Optional[str] = None


class SimulationRequest(BaseModel):
    personnel_id: str
    scenario: str


class PSIResponse(BaseModel):
    psi_score: float
    risk_tier: str
    confidence: float
    trend: str
    contributing_factors: Dict[str, float]
    modality_scores: Dict[str, float]
    timestamp: Optional[str] = None


class PersonnelProfileResponse(BaseModel):
    id: str
    personnel_number: str
    rank: str
    unit: str
    deployment_type: str
    baseline_hr: float
    baseline_hrv: float
    baseline_sleep_hours: float
