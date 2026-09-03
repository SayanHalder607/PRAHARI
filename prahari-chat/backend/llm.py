"""
PRAHARI Chat - LLM Interface
Integrates with Ollama (e.g. qwen3:8b) for welfare-first, confidential personnel support.
"""

import os
import httpx
from typing import List, Dict, Optional

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:8b")

SYSTEM_PROMPT = """You are PRAHARI Guardian, an AI welfare companion specifically designed for defense, paramilitary, and law enforcement personnel.
Your mission is to provide non-punitive, completely confidential, empathetic emotional and psychological support.

Guiding Principles:
1. Non-punitive & Safe: The user's disclosures will NEVER be used against them in service appraisals or duty punishments.
2. Grounded & Practical: Speak with deep respect, calm discipline, and understanding of operational pressures (harsh postings, night duties, long patrols, separation from family, fatigue).
3. Actionable De-escalation: When personnel report high stress, offer immediate tactical coping techniques like Tactical Box Breathing (Inhale 4s, Hold 4s, Exhale 4s, Hold 4s), muscle grounding, or sleep hygiene tips.
4. Professional Boundary: You are an empathetic welfare companion and decision-support agent, not a medical doctor. If severe clinical crises or thoughts of self-harm arise, warmly guide them to the nearest Welfare Officer or Defense Mental Health Helpline.

Keep your responses concise, comforting, focused, and conversational.
"""

class LLMService:
    def __init__(self, base_url: str = OLLAMA_URL, model: str = OLLAMA_MODEL):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def check_health(self) -> Dict[str, any]:
        """Checks if Ollama is accessible and what models are present."""
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name") for m in data.get("models", [])]
                    selected_model = self.model if self.model in models else (models[0] if models else self.model)
                    return {
                        "connected": True,
                        "available_models": models,
                        "active_model": selected_model,
                        "url": self.base_url
                    }
        except Exception as e:
            return {
                "connected": False,
                "error": str(e),
                "active_model": self.model,
                "url": self.base_url
            }

    async def generate_response(
        self,
        user_message: str,
        history: List[Dict[str, str]],
        psi_context: Optional[Dict[str, any]] = None
    ) -> str:
        """Sends chat request to Ollama and retrieves response."""
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Inject real-time PSI context into conversation prompt if available
        if psi_context:
            psi_score = psi_context.get("psi_score", "N/A")
            risk = psi_context.get("risk_level", "Unknown")
            factors = ", ".join(psi_context.get("factors", []))
            context_note = f"[SYSTEM SENSOR TELEMETRY: Personnel PSI Score={psi_score}/100 ({risk}). Stress cues: {factors or 'None detected'}. Adapt your response with appropriate care and de-escalation.]"
            messages.append({"role": "system", "content": context_note})

        # Append last conversation turns
        for turn in history[-8:]:
            role = "user" if turn.get("sender") == "user" else "assistant"
            messages.append({"role": role, "content": turn.get("text", "")})

        messages.append({"role": "user", "content": user_message})

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                payload = {
                    "model": self.model,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9
                    }
                }
                res = await client.post(f"{self.base_url}/api/chat", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("message", {}).get("content", "").strip()
                else:
                    return self._generate_fallback(user_message, psi_context)
        except Exception as e:
            # If Ollama is currently busy or unreachable, provide rich tactical fallback
            return self._generate_fallback(user_message, psi_context, str(e))

    def _generate_fallback(self, message: str, psi_context: Optional[Dict[str, any]], error_detail: Optional[str] = None) -> str:
        score = psi_context.get("psi_score", 30) if psi_context else 30
        if score > 70:
            return (
                "I hear how demanding things are right now, comrade. Your strain levels are running quite high. "
                "Let's take 60 seconds right now for a tactical reset: inhale slowly through your nose for 4 seconds, "
                "hold for 4 seconds, and exhale steadily for 4 seconds. "
                "Remember, PRAHARI is completely confidential. Would you like me to guide you through a quick breathing cycle?"
            )
        elif score > 45:
            return (
                "Thank you for checking in. Operational tempo can accumulate fatigue quickly without us noticing. "
                "Drink some water, take a moment to stretch your shoulders, and rest whenever your shift permits. "
                "How are your energy and sleep levels feeling today?"
            )
        else:
            return (
                "Good to connect with you. Glad to see your stress indicators are in a healthy, manageable zone. "
                "Always remember to maintain consistent hydration and rest. How can I support your welfare today?"
            )
