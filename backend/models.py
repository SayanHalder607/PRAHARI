from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import uuid
import enum


class Role(str, enum.Enum):
    PERSONNEL = "personnel"
    WELFARE_OFFICER = "welfare_officer"
    MEDICAL_OFFICER = "medical_officer"
    COMMANDER = "commander"
    ADMIN = "admin"


class RiskTier(str, enum.Enum):
    LEVEL_0 = "self_awareness"
    LEVEL_1 = "personnel_wellness"
    LEVEL_2 = "welfare_officer"
    LEVEL_3 = "urgent_human_review"


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    personnel_id = Column(String, ForeignKey("personnel_profiles.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class PersonnelProfile(Base):
    __tablename__ = "personnel_profiles"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    personnel_number = Column(String, unique=True, nullable=False)
    rank = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    deployment_type = Column(String, nullable=False)
    baseline_hr = Column(Float, default=72.0)
    baseline_hrv = Column(Float, default=55.0)
    baseline_sleep_hours = Column(Float, default=7.0)
    baseline_stress = Column(Float, default=25.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    wearable_readings = relationship("WearableReading", back_populates="personnel")
    sleep_records = relationship("SleepRecord", back_populates="personnel")
    duty_records = relationship("DutyRecord", back_populates="personnel")
    psychometric_checkins = relationship("PsychometricCheckIn", back_populates="personnel")
    stress_predictions = relationship("StressPrediction", back_populates="personnel")


class WearableReading(Base):
    __tablename__ = "wearable_readings"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    personnel_id = Column(String, ForeignKey("personnel_profiles.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    heart_rate = Column(Float, nullable=False)
    hrv = Column(Float, nullable=False)
    spo2 = Column(Float, nullable=False)
    eda = Column(Float, nullable=False)
    skin_temperature = Column(Float, nullable=False)
    accelerometer_x = Column(Float, nullable=False)
    accelerometer_y = Column(Float, nullable=False)
    accelerometer_z = Column(Float, nullable=False)
    activity_level = Column(Float, nullable=False)
    step_count = Column(Integer, nullable=False)

    personnel = relationship("PersonnelProfile", back_populates="wearable_readings")


class SleepRecord(Base):
    __tablename__ = "sleep_records"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    personnel_id = Column(String, ForeignKey("personnel_profiles.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    sleep_duration = Column(Float, nullable=False)
    sleep_efficiency = Column(Float, nullable=False)
    interruptions = Column(Integer, nullable=False)
    deep_sleep_percentage = Column(Float, nullable=False)
    rem_sleep_percentage = Column(Float, nullable=False)
    sleep_debt = Column(Float, nullable=False)

    personnel = relationship("PersonnelProfile", back_populates="sleep_records")


class DutyRecord(Base):
    __tablename__ = "duty_records"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    personnel_id = Column(String, ForeignKey("personnel_profiles.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    duty_hours = Column(Float, nullable=False)
    consecutive_days = Column(Integer, nullable=False)
    night_shift = Column(Boolean, default=False)
    operational_intensity = Column(Float, nullable=False)
    break_duration = Column(Float, nullable=False)
    time_since_rest = Column(Float, nullable=False)

    personnel = relationship("PersonnelProfile", back_populates="duty_records")


class PsychometricCheckIn(Base):
    __tablename__ = "psychometric_checkins"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    personnel_id = Column(String, ForeignKey("personnel_profiles.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    perceived_stress = Column(Integer, nullable=False)
    sleep_quality = Column(Integer, nullable=False)
    fatigue_level = Column(Integer, nullable=False)
    emotional_state = Column(Integer, nullable=False)
    workload_perception = Column(Integer, nullable=False)
    recovery_level = Column(Integer, nullable=False)
    willingness_to_talk = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)

    personnel = relationship("PersonnelProfile", back_populates="psychometric_checkins")


class StressPrediction(Base):
    __tablename__ = "stress_predictions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    personnel_id = Column(String, ForeignKey("personnel_profiles.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    psi_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    risk_tier = Column(String, nullable=False)
    contributing_factors = Column(JSON, nullable=False)
    trend = Column(String, nullable=False)
    physiological_score = Column(Float, nullable=False)
    facial_score = Column(Float, nullable=False)
    sleep_score = Column(Float, nullable=False)
    workload_score = Column(Float, nullable=False)
    psychometric_score = Column(Float, nullable=False)
    historical_score = Column(Float, nullable=False)

    personnel = relationship("PersonnelProfile", back_populates="stress_predictions")


class Alert(Base):
    __tablename__ = "alerts"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    personnel_id = Column(String, ForeignKey("personnel_profiles.id"), nullable=False)
    prediction_id = Column(String, ForeignKey("stress_predictions.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    alert_level = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="pending")
    acknowledged_by = Column(String, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)


class Intervention(Base):
    __tablename__ = "interventions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    personnel_id = Column(String, ForeignKey("personnel_profiles.id"), nullable=False)
    alert_id = Column(String, ForeignKey("alerts.id"), nullable=True)
    intervention_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    welfare_officer_id = Column(String, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    outcome = Column(Text, nullable=True)
    outcome_timestamp = Column(DateTime, nullable=True)
    effectiveness_score = Column(Float, nullable=True)


class ModelVersion(Base):
    __tablename__ = "model_versions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    version = Column(String, nullable=False)
    model_type = Column(String, nullable=False)
    accuracy = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    auroc = Column(Float, nullable=False)
    training_timestamp = Column(DateTime, default=datetime.utcnow)
    config = Column(JSON, nullable=False)


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    personnel_id = Column(String, ForeignKey("personnel_profiles.id"), nullable=True)
    sender = Column(String, nullable=False)  # "user" or "assistant"
    message = Column(Text, nullable=False)
    psi_score = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

