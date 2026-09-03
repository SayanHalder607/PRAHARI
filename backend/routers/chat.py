"""
PRAHARI AI Companion Router
Provides confidential, welfare-first AI conversational support powered by Ollama (qwen3:8b),
grounded in real-time personnel stress telemetry, physiological baselines, and database persistence.
"""

import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import httpx

from database import get_db
from models import User, StressPrediction, PersonnelProfile, ChatMessage
from auth import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:8b")

SYSTEM_PROMPT = """You are PRAHARI Guardian, an empathetic, defense-grade welfare companion designed for tactical and military personnel.
Your mission is to provide non-punitive, completely confidential emotional, fatigue, and stress support.

Core Principles:
1. Strict Confidentiality: Personnel disclosures are 100% confidential and NEVER used in service appraisals or duty punishments.
2. Grounded Understanding: Acknowledge tactical operational tempo (extended night shifts, harsh terrain, sensory fatigue, separation from family).
3. Actionable Decompression: When personnel report acute strain or when their PSI is elevated, suggest practical resets such as Tactical Box Breathing (4-4-4-4: Inhale 4s, Hold 4s, Exhale 4s, Hold 4s), muscle grounding, and structured rest.
4. Non-Medical Boundary: Offer psychological first-aid and empathetic peer listening. If severe crises arise, warmly recommend speaking with their unit Welfare Officer or Medical Officer.

Be concise, respectful, disciplined, and supportive.
"""

class ChatMessageRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []

@router.get("/status")
async def get_chat_status():
    """Check connection status with local Ollama service."""
    ollama_url = OLLAMA_URL.rstrip("/")
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(f"{ollama_url}/api/tags")
            if res.status_code == 200:
                data = res.json()
                models = [m.get("name") for m in data.get("models", [])]
                active_model = OLLAMA_MODEL if OLLAMA_MODEL in models else (models[0] if models else OLLAMA_MODEL)
                return {
                    "connected": True,
                    "active_model": active_model,
                    "available_models": models,
                    "url": ollama_url
                }
    except Exception as e:
        return {
            "connected": False,
            "error": str(e),
            "active_model": OLLAMA_MODEL,
            "url": ollama_url
        }

@router.get("/history")
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full persistent chat history for the authenticated user from the database."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.timestamp.asc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": m.id,
            "role": m.sender,
            "content": m.message,
            "psi_score": m.psi_score,
            "timestamp": m.timestamp.strftime("%I:%M %p") if m.timestamp else ""
        }
        for m in messages
    ]

@router.get("/summary")
async def get_wellness_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve personalized AI stress & telemetry briefing for the logged-in user."""
    prediction = None
    if current_user.personnel_id:
        prediction = (
            db.query(StressPrediction)
            .filter(StressPrediction.personnel_id == current_user.personnel_id)
            .order_by(StressPrediction.timestamp.desc())
            .first()
        )

    psi_score = prediction.psi_score if prediction else 28.5
    trend = prediction.trend if prediction else "stable"
    factors = prediction.contributing_factors if prediction and prediction.contributing_factors else {
        "Sleep quality": "Good",
        "Operational load": "Moderate"
    }

    return {
        "personnel_id": current_user.personnel_id or current_user.username,
        "psi_score": psi_score,
        "trend": trend,
        "factors": factors,
        "summary": f"Personnel indicators currently show {trend.lower()} baseline with a PSI of {psi_score:.1f}. Recovery intervals remain within monitored limits."
    }

@router.post("/message")
async def send_chat_message(
    body: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process message, persist conversation to database, and return stress-calibrated Ollama response."""
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Fetch live telemetry for personalized context
    prediction = None
    profile = None
    if current_user.personnel_id:
        prediction = (
            db.query(StressPrediction)
            .filter(StressPrediction.personnel_id == current_user.personnel_id)
            .order_by(StressPrediction.timestamp.desc())
            .first()
        )
        profile = (
            db.query(PersonnelProfile)
            .filter(PersonnelProfile.id == current_user.personnel_id)
            .first()
        )

    psi_score = prediction.psi_score if prediction else 30.0
    risk_tier = prediction.risk_tier if prediction else "self_awareness"
    trend = prediction.trend if prediction else "stable"
    rank_and_name = f"{profile.rank} {profile.personnel_number}" if profile else current_user.username

    # 1. Persist user message to the database
    user_record = ChatMessage(
        user_id=current_user.id,
        personnel_id=current_user.personnel_id,
        sender="user",
        message=body.message,
        psi_score=psi_score
    )
    db.add(user_record)
    db.commit()

    # Build prompt messages
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    telemetry_note = (
        f"[SENSOR CONTEXT: Speaking to {rank_and_name}. Real-time PSI={psi_score:.1f}/100, "
        f"Tier={risk_tier}, Trend={trend}. Align guidance with this operational state.]"
    )
    messages.append({"role": "system", "content": telemetry_note})

    # Append recent conversation history
    for turn in (body.history or [])[-8:]:
        role = "user" if turn.get("role") == "user" or turn.get("sender") == "user" else "assistant"
        content = turn.get("content") or turn.get("text", "")
        if content:
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": body.message})

    # Call Ollama
    ollama_url = OLLAMA_URL.rstrip("/")
    reply_text = None

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            payload = {
                "model": OLLAMA_MODEL,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9
                }
            }
            res = await client.post(f"{ollama_url}/api/chat", json=payload)
            if res.status_code == 200:
                data = res.json()
                reply_text = data.get("message", {}).get("content", "").strip()
    except Exception:
        pass

    # Fallback tactical response if Ollama is warming up or temporarily busy
    if not reply_text:
        if psi_score > 65:
            reply_text = (
                f"Jai Hind, {rank_and_name}. Your telemetry reflects elevated strain ({psi_score:.1f} PSI). "
                "Let's pause right now for a 60-second tactical reset: inhale steadily for 4 seconds, hold for 4, "
                "exhale for 4, and hold for 4. How are your muscles and breathing feeling right now?"
            )
        else:
            reply_text = (
                f"Jai Hind, {rank_and_name}. Good to hear from you. Your operational indicators are stable at {psi_score:.1f} PSI. "
                "Remember to hydrate and take micro-breaks whenever your post allows. What is on your mind today?"
            )

    # 2. Persist assistant reply to the database
    assistant_record = ChatMessage(
        user_id=current_user.id,
        personnel_id=current_user.personnel_id,
        sender="assistant",
        message=reply_text,
        psi_score=psi_score
    )
    db.add(assistant_record)
    db.commit()

    return {
        "reply": reply_text,
        "psi_context": {
            "psi_score": psi_score,
            "risk_tier": risk_tier,
            "trend": trend,
            "personnel_id": current_user.personnel_id
        },
        "timestamp": datetime.utcnow().strftime("%I:%M %p")
    }
