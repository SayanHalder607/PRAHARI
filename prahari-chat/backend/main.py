"""
PRAHARI Chat Backend API
FastAPI backend powering the interactive welfare assistant with real-time PSI stress analytics.
"""

import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from psi_engine import ConversationalPSIEngine, get_current_psi
from llm import LLMService

app = FastAPI(
    title="PRAHARI Chat - AI Personnel Welfare Assistant",
    description="Confidential, real-time stress assessment and welfare companion for personnel.",
    version="1.0.0"
)

# Enable CORS for local and docker frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

psi_engine = ConversationalPSIEngine()
llm_service = LLMService()

class ChatTurn(BaseModel):
    sender: str
    text: str

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    history: Optional[List[Any]] = []
    sleep_hours: Optional[float] = None
    fatigue_level: Optional[int] = Field(None, ge=1, le=10)
    duty_hours: Optional[float] = None
    mood: Optional[int] = Field(None, ge=1, le=5)

@app.get("/api/current_psi")
async def current_psi():
    return get_current_psi()

@app.get("/api/summary")
async def get_summary():
    psi_data = get_current_psi()
    return {
        "summary": f"Personnel indicators are currently {psi_data['trend'].lower()} with a PSI score of {psi_data['psi_score']}. Baseline sleep and operational parameters are actively monitored."
    }

class AssessRequest(BaseModel):
    text: str = ""
    sleep_hours: Optional[float] = None
    fatigue_level: Optional[int] = Field(None, ge=1, le=10)
    duty_hours: Optional[float] = None
    mood: Optional[int] = Field(None, ge=1, le=5)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "prahari-chat-backend",
        "version": "1.0.0"
    }

@app.get("/api/status")
async def get_service_status():
    ollama_status = await llm_service.check_health()
    return {
        "service": "prahari-chat",
        "ollama": ollama_status,
        "features": {
            "psi_stress_engine": True,
            "tactical_coping": True,
            "confidential_logging": True
        }
    }

@app.post("/api/assess")
async def assess_stress(req: AssessRequest):
    assessment = psi_engine.compute_composite_psi(
        text=req.text,
        sleep_hours=req.sleep_hours,
        fatigue_level=req.fatigue_level,
        duty_hours=req.duty_hours,
        reported_mood=req.mood
    )
    return assessment

@app.post("/api/chat")
async def chat_interaction(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # 1. Compute multi-modal PSI based on message content & optional metrics
    psi_assessment = psi_engine.compute_composite_psi(
        text=req.message,
        sleep_hours=req.sleep_hours,
        fatigue_level=req.fatigue_level,
        duty_hours=req.duty_hours,
        reported_mood=req.mood
    )

    # 2. Query Ollama model with stress-aware context
    history_dicts = []
    if req.history:
        for turn in req.history:
            if isinstance(turn, dict):
                sender = turn.get("sender") or turn.get("role", "user")
                text = turn.get("text") or turn.get("content", "")
            else:
                sender = getattr(turn, "sender", getattr(turn, "role", "user"))
                text = getattr(turn, "text", getattr(turn, "content", ""))
            history_dicts.append({"sender": sender, "text": text})
    reply_text = await llm_service.generate_response(
        user_message=req.message,
        history=history_dicts,
        psi_context=psi_assessment
    )

    return {
        "reply": reply_text,
        "psi_assessment": psi_assessment
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
