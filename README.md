# PRAHARI (प्रहरी) — AI-Based Personnel Stress & Welfare Monitoring System

<div align="center">

![PRAHARI Banner](https://img.shields.io/badge/PRAHARI-Guardian%20AI-059669?style=for-the-badge&logo=shield&logoColor=white)
![Hackathon](https://img.shields.io/badge/SIH%202026-Problem%20SIH26186-blue?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React%2018-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TimescaleDB](https://img.shields.io/badge/TimescaleDB-FDB515?style=for-the-badge&logo=postgresql&logoColor=black)
![Ollama](https://img.shields.io/badge/Ollama-Qwen3%3A8B-black?style=for-the-badge&logo=ollama)
![Docker](https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**A welfare-first, non-punitive multimodal AI decision-support platform designed to monitor, predict, and de-escalate stress for defense and tactical personnel.**

[Quick Start](#-quick-start) • [Architecture](#-multimodal-psi-fusion-architecture) • [Microservices & Ports](#-microservices--ports) • [AI Chat Companion](#-prahari-ai-welfare-companion) • [Role-Based Access](#-role-based-access--demo-credentials) • [Ethical Safeguards](#-privacy-ethics--non-punitive-safeguards)

</div>

---

## ⚠️ Important Disclaimer

> **PRAHARI is a research and decision-support prototype.** It is strictly designed for welfare assistance and does **not** diagnose medical conditions, prescribe treatment, or replace qualified medical or psychological care. Stress estimates are probabilistic signals aimed at early welfare intervention and peer support.

---

## 🛡️ Executive Overview

Personnel serving in high-tempo operational theaters (border defense, counter-insurgency, maritime patrols, law enforcement) endure extreme physical and cognitive stress:
- Chronic sleep deficits and circadian disruption
- Sustained sympathetic nervous system arousal
- Harsh climatic and physical operating conditions
- Operational isolation from family and support networks

**PRAHARI** (Sanskrit: *प्रहरी* — "The Guardian") provides an end-to-end, continuous personnel wellness monitoring ecosystem that integrates wearable telemetry, computer-vision behavioral indicators, duty operational records, and voluntary psychometric check-ins into an explainable **Personnel Stress Index (PSI)**.

---

## 🧠 Multimodal PSI Fusion Architecture

The **Personnel Stress Index (PSI)** scales from **0 (Optimal Wellness)** to **100 (Critical Strain)** through a weighted multimodal fusion pipeline:

```
                      ┌───────────────────────────────┐
                      │    Wearable Physiological     │  30% Weight
                      │   (HR, HRV, EDA, SpO2, Temp)  │
                      └───────────────┬───────────────┘
                                      │
                      ┌───────────────┴───────────────┐
                      │     Sleep & Fatigue Metric    │  20% Weight
                      │ (Duration, Disruption Index)  │
                      └───────────────┬───────────────┘
                                      │
┌────────────────────────┐            ▼            ┌────────────────────────┐
│ Facial-Behavioral Cues │ ──►  [ PSI FUSION ] ◄── │  Operational Workload  │
│  (Eye Aspect, Blinks,  │         ENGINE          │  (Shift Hours, Patrol  │
│  AU Micro-Expressions) │        (0 - 100)        │      Duty Tempo)       │
│      15% Weight        │            ▲            │       15% Weight       │
└────────────────────────┘            │            └────────────────────────┘
                      ┌───────────────┴───────────────┐
                      │    Psychometric Check-in &    │  20% Weight
                      │   Conversational Sentiments   │
                      └───────────────────────────────┘
```

### Risk Stratification & Protocols
| PSI Range | Status Level | Color | Automated Welfare Protocol |
| :---: | :---: | :---: | :--- |
| **0 – 35** | **Normal / Low Strain** | 🟢 Green | Routine operational tempo, standard hydration & recovery baseline. |
| **36 – 65** | **Moderate Strain** | 🟡 Yellow | Recommended micro-breaks, hydration reminder, 20-min recuperation pause. |
| **66 – 85** | **High Strain** | 🟠 Orange | Mandatory pause; trigger 4-4-4-4 tactical box breathing; notify welfare peer. |
| **86 – 100** | **Severe / Critical** | 🔴 Red | Immediate duty decompression protocol; confidential medical check-in notice. |

---

## 🌐 Unified Architecture & Ports

PRAHARI runs as a unified, production-ready stack:

| Service | Port / URL | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
| **Main Dashboard Frontend** | `http://localhost:3000` | Real-time monitoring UI, self-checkin, unit analytics & **Integrated AI Companion** (`/chat`) | React 18, Vite, TailwindCSS |
| **Main Backend API** | `http://localhost:8000` | Core REST & WebSocket server, PSI engine & `/api/chat` Ollama router | FastAPI, Python 3.10+, SQLAlchemy |
| **TimescaleDB / PostgreSQL** | `localhost:5432` | High-throughput time-series physiological database & persistent chat history | TimescaleDB (PG 15) |
| **Local LLM Engine** | `localhost:11434` | Private on-device Large Language Model inference | Ollama (`qwen3:8b`) |

---

## 🤖 Integrated PRAHARI AI Companion (`/chat`)

The AI Companion is built natively into the main dashboard and backend:

- **Database-Backed Persistence:** Conversations are saved to the `chat_messages` table in PostgreSQL/TimescaleDB, linked to the authenticated soldier's personnel profile.
- **Local Inference via Ollama (`qwen3:8b`):** Completely private and on-premise; no confidential disclosures ever leave the defense network.
- **Real-Time Telemetry Context:** Injects the soldier's live PSI score, trend, and duty status into the prompt context for stress-calibrated psychological first-aid.
- **Tactical Box Breathing (4-4-4-4):** Interactive visual de-arousal tool simulating defense standard breathing resets (Inhale 4s, Hold 4s, Exhale 4s, Hold 4s).

---

## 🚀 Quick Start

### Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) installed and running.
- [Ollama](https://ollama.ai/) installed on host with `qwen3:8b`:
  ```bash
  ollama pull qwen3:8b
  ollama serve
  ```

### Launch PRAHARI System
```bash
git clone https://github.com/SayanHalder607/PRAHARI.git
cd PRAHARI

# Starts TimescaleDB, Backend, and Frontend (all services unified)
docker compose up -d --build
```
- Dashboard & AI Companion: **[http://localhost:3000](http://localhost:3000)**
- Interactive API Docs: **[http://localhost:8000/docs](http://localhost:8000/docs)**


---

## 👥 Role-Based Access & Demo Credentials

The database is pre-seeded with demo profiles across operational tiers:

| Role | Username | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Personnel** | `personnel1` | `demo123` | Personal telemetry, self check-in, facial scan, trends. |
| **Welfare Officer** | `welfare1` | `demo123` | Unit-level stress distributions, intervention logging, alerts. |
| **Commander** | `commander1` | `demo123` | Aggregated readiness heatmaps, operational duty rota planning. |
| **Administrator** | `admin` | `demo123` | Full system telemetry configuration, user management, audit logs. |

---

## 🔒 Privacy, Ethics & Non-Punitive Safeguards

1. **Non-Punitive Doctrine:** Disclosures, high PSI alerts, or chat conversations are strictly sealed from promotion boards, annual confidential reports (ACR/APAR), and disciplinary proceedings.
2. **Command Anonymization:** Commanders see unit-level readiness and fatigue heatmaps without individual identifying tags, preventing stigma.
3. **Zero External Cloud Leakage:** All LLM queries, facial landmark processing, and physiological analyses are performed on-premises.
4. **Transparent Explainability:** Every calculated PSI score provides the individual mathematical factor contribution breakdown.

---

## 📁 Repository Structure

```
PRAHARI/
├── backend/                  # Main FastAPI application
│   ├── auth.py               # JWT authentication & role-based access
│   ├── database.py           # TimescaleDB / SQLite connection engine
│   ├── facial_analyzer.py    # MediaPipe facial behavioral stress cue extraction
│   ├── main.py               # API endpoints & WebSocket simulation stream
│   ├── models.py             # SQLAlchemy ORM schemas (including ChatMessage)
│   ├── psi_engine.py         # Multi-modal PSI calculation engine
│   └── routers/              # Modular routers (chat.py, personnel, alerts, etc.)
├── frontend/                 # Main React Dashboard
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, TrendChart, FacialScan, etc.)
│   │   ├── pages/            # Role dashboards, Live Monitor, ChatCompanion.tsx
│   │   └── api.ts            # Centralized API client with JWT interceptor
│   └── vite.config.ts        # Vite configuration with proxy to backend
├── data/                     # Mock generators & test datasets
├── tests/                    # Unit & integration test suite (PSI, security, auth)
└── docker-compose.yml        # Unified orchestration (db, backend, frontend)
```

---

## 🤝 Smart India Hackathon 2026 Credits

- **Problem Statement:** SIH26186 — AI-Based Predictive Personnel Stress & Welfare Monitoring System
- **Repository:** [https://github.com/SayanHalder607/PRAHARI](https://github.com/SayanHalder607/PRAHARI)
- **License:** MIT License