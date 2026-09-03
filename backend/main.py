"""
PRAHARI - AI-Based Predictive Personnel Stress & Welfare Monitoring System
Main FastAPI Application
"""

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import asyncio
import numpy as np

from database import get_db, engine, Base
from models import (
    User, PersonnelProfile, WearableReading, SleepRecord,
    DutyRecord, PsychometricCheckIn, StressPrediction, Alert, Intervention,
)
from auth import get_current_user, create_access_token, authenticate_user
from schemas import LoginRequest, WellnessCheckInRequest, SimulationRequest
from psi_engine import PSIEngine
from simulation import SensorSimulator
from seed_data import seed_database
from routers import chat

# Create tables & seed
Base.metadata.create_all(bind=engine)
try:
    seed_database()
except Exception:
    pass

psi_engine = PSIEngine()
sensor_simulator = SensorSimulator()

app = FastAPI(
    title="PRAHARI API",
    description="AI-Based Predictive Personnel Stress & Welfare Monitoring System",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)

simulation_state: Dict[str, Any] = {
    "active_personnel": {},
    "websocket_clients": set(),
}


@app.on_event("startup")
def on_startup():
    try:
        seed_database()
    except Exception:
        pass


# ────────────────── Health ──────────────────
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "disclaimer": (
            "PRAHARI is a research/prototype decision-support system. "
            "It does not diagnose mental illness or replace qualified medical assessment."
        ),
    }


# ────────────────── Auth ──────────────────
@app.post("/api/auth/login")
async def login(body: LoginRequest, db=Depends(get_db)):
    user = authenticate_user(db, body.username, body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(data={"sub": user.username, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "personnel_id": user.personnel_id,
        },
    }


# ────────────────── Personnel PSI ──────────────────
@app.get("/api/personnel/{personnel_id}/psi")
async def get_personnel_psi(
    personnel_id: str,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    prediction = (
        db.query(StressPrediction)
        .filter(StressPrediction.personnel_id == personnel_id)
        .order_by(StressPrediction.timestamp.desc())
        .first()
    )
    if not prediction:
        return {"psi_score": 25.0, "risk_tier": "self_awareness", "trend": "stable"}
    return {
        "psi_score": prediction.psi_score,
        "risk_tier": prediction.risk_tier,
        "confidence": prediction.confidence,
        "trend": prediction.trend,
        "contributing_factors": prediction.contributing_factors,
        "modality_scores": {
            "physiological": prediction.physiological_score,
            "facial_behavioral": prediction.facial_score,
            "sleep_fatigue": prediction.sleep_score,
            "operational_load": prediction.workload_score,
            "psychometric": prediction.psychometric_score,
            "historical_trend": prediction.historical_score,
        },
        "timestamp": prediction.timestamp.isoformat(),
    }


@app.get("/api/personnel/{personnel_id}/trend")
async def get_personnel_trend(
    personnel_id: str,
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    predictions = (
        db.query(StressPrediction)
        .filter(
            StressPrediction.personnel_id == personnel_id,
            StressPrediction.timestamp >= datetime.utcnow() - timedelta(days=days),
        )
        .order_by(StressPrediction.timestamp)
        .all()
    )
    return [
        {"timestamp": p.timestamp.isoformat(), "psi_score": p.psi_score, "trend": p.trend}
        for p in predictions
    ]


# ────────────────── Simulation ──────────────────
@app.post("/api/simulation/start")
async def start_simulation(body: SimulationRequest, current_user: User = Depends(get_current_user)):
    valid = ["normal", "fatigue", "high_stress", "recovery", "critical", "physical_exertion"]
    if body.scenario not in valid:
        raise HTTPException(status_code=400, detail="Invalid scenario")
    simulation_state["active_personnel"][body.personnel_id] = {
        "scenario": body.scenario,
        "start_time": datetime.utcnow(),
        "readings_count": 0,
    }
    return {"status": "started", "scenario": body.scenario}


@app.post("/api/simulation/stop")
async def stop_simulation(body: SimulationRequest, current_user: User = Depends(get_current_user)):
    simulation_state["active_personnel"].pop(body.personnel_id, None)
    return {"status": "stopped"}


@app.get("/api/simulation/reading")
async def get_simulation_reading(
    personnel_id: str,
    current_user: User = Depends(get_current_user),
):
    if personnel_id not in simulation_state["active_personnel"]:
        return sensor_simulator.generate_reading("normal")
    scenario = simulation_state["active_personnel"][personnel_id]["scenario"]
    return sensor_simulator.generate_reading(scenario)


# ────────────────── Wellness Check-In ──────────────────
@app.post("/api/wellness-checkin")
async def submit_wellness_checkin(
    body: WellnessCheckInRequest,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    personnel_id = body.personnel_id or current_user.personnel_id
    if not personnel_id:
        raise HTTPException(status_code=400, detail="No personnel_id")

    checkin = PsychometricCheckIn(
        personnel_id=personnel_id,
        perceived_stress=body.perceived_stress,
        sleep_quality=body.sleep_quality,
        fatigue_level=body.fatigue_level,
        emotional_state=body.emotional_state,
        workload_perception=body.workload_perception,
        recovery_level=body.recovery_level,
        willingness_to_talk=body.willingness_to_talk,
        notes=body.notes,
    )
    db.add(checkin)
    db.commit()

    psi_result = _calculate_and_store_psi(db, personnel_id, checkin_data=body.model_dump())
    return {"status": "submitted", "psi_result": psi_result}


# ────────────────── Dashboards ──────────────────
@app.get("/api/dashboard/personnel/{personnel_id}")
async def get_personnel_dashboard(
    personnel_id: str,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    personnel = db.query(PersonnelProfile).filter(PersonnelProfile.id == personnel_id).first()
    latest_reading = (
        db.query(WearableReading)
        .filter(WearableReading.personnel_id == personnel_id)
        .order_by(WearableReading.timestamp.desc())
        .first()
    )
    latest_sleep = (
        db.query(SleepRecord)
        .filter(SleepRecord.personnel_id == personnel_id)
        .order_by(SleepRecord.date.desc())
        .first()
    )
    latest_prediction = (
        db.query(StressPrediction)
        .filter(StressPrediction.personnel_id == personnel_id)
        .order_by(StressPrediction.timestamp.desc())
        .first()
    )
    return {
        "personnel": {
            "id": personnel.id if personnel else personnel_id,
            "number": personnel.personnel_number if personnel else "Unknown",
            "rank": personnel.rank if personnel else "Unknown",
            "unit": personnel.unit if personnel else "Unknown",
        },
        "current_psi": latest_prediction.psi_score if latest_prediction else 25.0,
        "risk_tier": latest_prediction.risk_tier if latest_prediction else "self_awareness",
        "latest_reading": {
            "heart_rate": latest_reading.heart_rate if latest_reading else 72.0,
            "hrv": latest_reading.hrv if latest_reading else 55.0,
            "spo2": latest_reading.spo2 if latest_reading else 97.0,
        },
        "sleep": {
            "duration": latest_sleep.sleep_duration if latest_sleep else 7.0,
            "efficiency": latest_sleep.sleep_efficiency if latest_sleep else 85.0,
        },
        "baselines": {
            "baseline_hr": personnel.baseline_hr if personnel else 72.0,
            "baseline_hrv": personnel.baseline_hrv if personnel else 55.0,
            "baseline_sleep": personnel.baseline_sleep_hours if personnel else 7.0,
        },
    }


@app.get("/api/dashboard/welfare-officer")
async def get_welfare_dashboard(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user.role not in ["welfare_officer", "medical_officer", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    predictions = (
        db.query(StressPrediction).order_by(StressPrediction.timestamp.desc()).limit(100).all()
    )
    personnel_summary = {}
    for pred in predictions:
        if pred.personnel_id not in personnel_summary:
            p = db.query(PersonnelProfile).filter(PersonnelProfile.id == pred.personnel_id).first()
            personnel_summary[pred.personnel_id] = {
                "personnel_id": pred.personnel_id,
                "personnel_number": p.personnel_number if p else "Unknown",
                "rank": p.rank if p else "Unknown",
                "unit": p.unit if p else "Unknown",
                "psi_score": pred.psi_score,
                "risk_tier": pred.risk_tier,
                "trend": pred.trend,
                "confidence": pred.confidence,
                "last_update": pred.timestamp.isoformat(),
            }
    return list(personnel_summary.values())


@app.get("/api/dashboard/commander")
async def get_commander_dashboard(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    if current_user.role not in ["commander", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    total_personnel = db.query(PersonnelProfile).count()
    predictions = (
        db.query(StressPrediction).order_by(StressPrediction.timestamp.desc()).limit(500).all()
    )
    psi_values = [p.psi_score for p in predictions]
    avg_psi = float(np.mean(psi_values)) if psi_values else 25.0
    n = max(1, len(psi_values))
    normal_count = sum(1 for v in psi_values if v <= 20)
    mild_count = sum(1 for v in psi_values if 21 <= v <= 40)
    moderate_count = sum(1 for v in psi_values if 41 <= v <= 60)
    high_count = sum(1 for v in psi_values if 61 <= v <= 80)
    critical_count = sum(1 for v in psi_values if v > 80)
    return {
        "total_personnel": total_personnel,
        "average_psi": round(avg_psi, 1),
        "distribution": {
            "normal_stable": normal_count,
            "mild_stress": mild_count,
            "moderate_stress": moderate_count,
            "high_stress": high_count,
            "critical": critical_count,
        },
        "percentages": {
            "normal_stable_pct": round(normal_count / n * 100, 1),
            "mild_stress_pct": round(mild_count / n * 100, 1),
            "moderate_stress_pct": round(moderate_count / n * 100, 1),
            "high_stress_pct": round(high_count / n * 100, 1),
            "critical_pct": round(critical_count / n * 100, 1),
        },
    }


# ────────────────── Alerts ──────────────────
@app.get("/api/alerts")
async def get_alerts(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    if current_user.role not in ["welfare_officer", "medical_officer", "commander", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).limit(50).all()
    return [
        {
            "id": a.id,
            "personnel_id": a.personnel_id,
            "alert_level": a.alert_level,
            "message": a.message,
            "status": a.status,
            "timestamp": a.timestamp.isoformat(),
        }
        for a in alerts
    ]


# ────────────────── WebSocket ──────────────────
@app.websocket("/ws/live/{personnel_id}")
async def websocket_endpoint(websocket: WebSocket, personnel_id: str):
    await websocket.accept()
    simulation_state["websocket_clients"].add(websocket)
    try:
        while True:
            if personnel_id in simulation_state["active_personnel"]:
                scenario = simulation_state["active_personnel"][personnel_id]["scenario"]
                reading = sensor_simulator.generate_reading(scenario)
                reading["psi_score"] = _calculate_quick_psi(scenario)
                await websocket.send_json({"type": "sensor_reading", "data": reading})
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        simulation_state["websocket_clients"].discard(websocket)


# ────────────────── Helpers ──────────────────
def _calculate_quick_psi(scenario: str) -> float:
    m = {
        "normal": 25,
        "fatigue": 55,
        "high_stress": 70,
        "recovery": 20,
        "critical": 85,
        "physical_exertion": 35,
    }
    return round(max(0, min(100, m.get(scenario, 25) + np.random.normal(0, 3))), 1)


def _calculate_and_store_psi(
    db,
    personnel_id: str,
    physiological_data: Optional[Dict] = None,
    sleep_data: Optional[Dict] = None,
    facial_data: Optional[Dict] = None,
    workload_data: Optional[Dict] = None,
    checkin_data: Optional[Dict] = None,
) -> Dict:
    personnel = db.query(PersonnelProfile).filter(PersonnelProfile.id == personnel_id).first()
    if not personnel:
        return {"error": "Personnel not found"}
    baselines = {
        "baseline_hr": personnel.baseline_hr,
        "baseline_hrv": personnel.baseline_hrv,
        "baseline_sleep_hours": personnel.baseline_sleep_hours,
    }
    phys = physiological_data or {
        "heart_rate": 72, "hrv": 55, "spo2": 97, "eda": 2.5,
    }
    slp = sleep_data or {
        "sleep_duration": 7.0, "sleep_efficiency": 85.0, "sleep_debt": 0,
    }
    wk = workload_data or {
        "duty_hours": 8, "consecutive_days": 1, "night_shift": False,
        "operational_intensity": 3, "time_since_rest": 4,
    }
    psych = checkin_data or {
        "perceived_stress": 3, "sleep_quality": 5, "fatigue_level": 3,
        "emotional_state": 5, "workload_perception": 3, "recovery_level": 7,
        "willingness_to_talk": 5,
    }
    prev = (
        db.query(StressPrediction)
        .filter(StressPrediction.personnel_id == personnel_id)
        .order_by(StressPrediction.timestamp.desc())
        .limit(10)
        .all()
    )
    previous_psi_values = [p.psi_score for p in prev]

    result = psi_engine.calculate_psi(
        physiological_data=phys,
        sleep_data=slp,
        facial_data=facial_data,
        workload_data=wk,
        psychometric_data=psych,
        previous_psi_values=previous_psi_values,
        personal_baselines=baselines,
    )

    prediction = StressPrediction(
        personnel_id=personnel_id,
        psi_score=result["psi_score"],
        confidence=result["confidence"],
        risk_tier=result["risk_tier"],
        contributing_factors=result["contributing_factors"],
        trend=result["trend"],
        physiological_score=result["modality_scores"]["physiological"],
        facial_score=result["modality_scores"]["facial_behavioral"],
        sleep_score=result["modality_scores"]["sleep_fatigue"],
        workload_score=result["modality_scores"]["operational_load"],
        psychometric_score=result["modality_scores"]["psychometric"],
        historical_score=result["modality_scores"]["historical_trend"],
    )
    db.add(prediction)
    db.commit()
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)