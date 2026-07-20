# ⚖️ TrialMind — AI Legal Reasoning Education Platform

> **Learn to reason through your case like a lawyer.**

TrialMind is an interactive legal-literacy simulator that teaches self-represented litigants how to evaluate evidence, anticipate counterarguments, and communicate clearly in civil disputes — through the same adversarial simulation method law schools have used for a century.

**Built entirely with Codex (GPT-5.6) for the OpenAI Build Week Hackathon.**

---

## 🏆 OpenAI Build Week Submission

| Field | Detail |
|-------|--------|
| **Track** | Education |
| **Built with** | Codex + GPT-5.6 |
| **Live Demo** | https://trial-mind.vercel.app |
| **Demo Video** | [YouTube Link] |
| **GitHub** | https://github.com/parthilbarot30/trialmind |

---

## 🤖 How Codex & GPT-5.6 Were Used

> This section is the most important part of this README. Every architectural decision in TrialMind was made inside Codex. Here is the specific breakdown.

### Codex as the Primary Development Environment

Every file in this repository was written using Codex — not scaffolded with a template and then edited, but written from scratch through iterative Codex sessions:

- **`backend/main.py`** — All 7 FastAPI endpoints, the three-persona prompt architecture, JSON parsing logic, jurisdiction data structures, and the learning/education engine were written and refined entirely in Codex
- **`frontend/src/App.jsx`** — All React components including ScoreGraph, KnowledgeCheck, MasteryBars, LearningObjectives, PersonaCard, EvidenceChecklist, RoundLearningRecap, and CourtPrepPanel — built component by component in Codex
- **`frontend/src/Auth.jsx`** — Full authentication flow with email/password and guest mode
- **`frontend/src/Dashboard.jsx`** — Case dashboard with persistence, colored type badges, and empty state
- **`frontend/src/Root.jsx`** — App routing with auth state management
- **`supabase/schema.sql`** — Full database schema with Row Level Security policies
- **`README.md`** — This file, structured with Codex

### How GPT-5.6 Powers the Runtime Experience

The deployed application calls the Groq API (OpenAI-compatible endpoint) with Llama 3.3 70B as the inference backend — architected to swap to GPT-5.6 via a single environment variable change. The model drives every AI feature:

#### 1. Three-Persona Adversarial Architecture
The most technically ambitious part of TrialMind is keeping three simultaneous AI personas genuinely distinct across multiple rounds of argument. Each persona has a system prompt with explicit prohibition language:

```
ADVOCATE: constructive, evidence-focused, jurisdiction-aware
→ Forbidden from hedging or expressing uncertainty

OPPOSING COUNSEL: aggressive, attacks procedural gaps, cites missing evidence
→ Forbidden from being constructive or offering encouragement

JUDGE: neutral, probing, focused on burden of proof
→ Forbidden from making rulings or expressing opinions
```

This prohibition-based approach — telling each persona what it cannot do rather than just what it should do — is what prevents voice bleed across rounds.

#### 2. Jurisdiction-Aware Prompting
State-specific law and case precedents are injected into every prompt as structured context. The model is forced to reason about specific statutes rather than generic legal principles:

```python
f"""
JURISDICTION: {jurisdiction}
APPLICABLE LAW: {law_text}
RELEVANT PRECEDENTS:
{case_text}
"""
```

This context injection happens on every `/analyze`, `/respond`, `/opening-statement`, and `/closing-argument` call — ensuring every output is grounded in real state law.

#### 3. Education Engine — Structured Output Pipeline
A dedicated `/learning` endpoint generates four education outputs simultaneously after every round:

```json
{
  "objectives": [...],        // 4 learning objectives before analysis
  "key_principle": "...",     // Most important legal principle
  "what_you_learned": [...],  // 3 concrete lessons per round
  "knowledge_check": [...],   // 2 interactive MCQ questions with explanations
  "mastery_areas": {          // 4-dimensional mastery scores 0-100
    "burden_of_proof": 72,
    "evidence_reasoning": 65,
    "argument_structure": 58,
    "legal_concept_mastery": 70
  }
}
```

Strict JSON output formatting with fallback parsing ensures reliable UI updates even when the model wraps output in markdown fences.

#### 4. Auto-Check Evidence Detection
A dedicated `/auto-check` endpoint runs after every analyze and respond call. It detects which evidence items the user has mentioned in their case description and responses, returning a JSON array of checklist indices for automatic checking:

```python
# Temperature 0.2 for maximum consistency
# "Be generous — if they mention something that clearly
#  corresponds to an item, include it."
```

This runs silently in the background — users see their checklist update automatically as they describe their evidence.

#### 5. Agentic Document Generation
Three separate generation endpoints produce court-ready documents synthesized from the full conversation history:
- `/opening-statement` — 3-paragraph statement written in first person for oral delivery
- `/closing-argument` — Opposition's closing + day-of-court preparation checklist
- Both are jurisdiction-aware and grounded in the specific evidence the user has confirmed

---

## ✨ Features

### Education Layer
- **Learning Objectives** — 4 specific legal concepts shown before analysis begins
- **What You Learned** — 3 concrete lessons generated after every round
- **Knowledge Check** — Interactive MCQ with immediate feedback and explanations
- **Mastery Dashboard** — Progress tracked across Burden of Proof, Evidence Reasoning, Argument Structure, Legal Concept Mastery
- **Score Progression Graph** — Visual SVG timeline of case strength improvement

### Adversarial Engine
- **Three simultaneous AI personas** — Advocate, Opposing Counsel, Judge
- **Round-by-round simulation** — Submit responses, watch reasoning improve
- **Case Readiness Score** — 0-100 with delta indicator per round
- **Jurisdiction-aware analysis** — 8 US states with real statutes and case law

### Evidence & Preparation
- **Auto-checking evidence checklist** — Detects evidence from text automatically
- **Priority ranking** — HIGH / MED / LOW for each evidence item
- **Opening Statement Generator** — Court-ready, first-person, for oral delivery
- **Closing Argument Preview** — See exactly what opposition will argue
- **Day-of-Court Checklist** — What to bring, conduct, what NOT to do
- **PDF Export** — Complete court report with all rounds and learning recaps

### Product
- **Full authentication** — Email/password with email confirmation
- **Guest mode** — No account required, test immediately
- **Case dashboard** — All saved cases with type badges and round count
- **Session persistence** — Full history saved to Supabase in real time
- **Mobile responsive** — Works on all screen sizes

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Code written with | Codex (GPT-5.6) |
| AI Inference | Groq API — Llama 3.3 70B (OpenAI-compatible) |
| Backend | Python + FastAPI |
| Frontend | React + Vite |
| UI | Font Awesome 6.5, Playfair Display, Manrope, DM Mono |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth |
| PDF Generation | jsPDF (client-side) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.11+
- Groq API key (free at https://console.groq.com)
- Supabase project (free at https://supabase.com)

### 1. Clone
```bash
git clone https://github.com/parthilbarot30/trialmind.git
cd trialmind
```

### 2. Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```

Run:
```bash
python -m uvicorn main:app --reload
```

Backend at `http://localhost:8000`

### 3. Database
Go to Supabase → SQL Editor → run the entire contents of `supabase/schema.sql`

### 4. Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run:
```bash
npm run dev
```

Frontend at `http://localhost:5173`

### 5. Test immediately (no setup required)
Visit https://trial-mind.vercel.app → click **"Try TrialMind without signing up"**

---

## 📁 Project Structure

```
trialmind/
├── backend/
│   ├── main.py              # All 7 API endpoints + AI logic
│   ├── requirements.txt
│   ├── render.yaml
│   └── runtime.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # All UI components + state
│   │   ├── Auth.jsx         # Authentication
│   │   ├── Dashboard.jsx    # Case dashboard
│   │   ├── Root.jsx         # App router
│   │   ├── supabase.js      # Supabase client
│   │   ├── index.css        # Global styles
│   │   └── main.jsx         # Entry point
│   └── index.html
└── supabase/
    └── schema.sql           # Full schema with RLS
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Initial analysis — all three personas respond |
| POST | `/respond` | Submit response — personas react to new information |
| POST | `/opening-statement` | Generate court-ready opening statement |
| POST | `/closing-argument` | Generate opposition closing + court prep checklist |
| POST | `/auto-check` | Detect evidence mentioned in text |
| POST | `/learning` | Generate learning objectives, recap, knowledge check, mastery |
| GET | `/` | Health check |

---

## 🎬 Demo Scenario

**Case type:** Small Claims — California

**Input:**
> "I am a freelance graphic designer. I was hired to design a complete brand identity package for $2,400. I delivered everything on time and the client approved all designs via email. They have refused to pay the remaining $1,200 balance, claiming the designs were 'not what they asked for' despite written approval. They are now using my designs on their signage and social media without paying me."

**What to observe:**
1. Learning objectives appear — burden of proof, evidence relevance, argument structure, California contract law
2. Three personas respond with distinct voices
3. Evidence checklist auto-checks items mentioned in the description
4. Case Readiness Score with critical gap identified
5. Submit response with Instagram screenshot evidence — score jumps
6. "What You Learned" recap + knowledge check appears
7. Mastery scores update across 4 dimensions
8. Generate opening statement and closing argument
9. Download full PDF court report

---

## 🔒 Security

- All API keys in environment variables — never in code
- Supabase RLS — users only access their own data
- Guest mode — no account required, no data stored
- No sensitive data in frontend bundle

---

## ⚠️ Legal Disclaimer

TrialMind is an AI-powered legal education tool. It is **not a substitute for professional legal advice**. The analysis does not constitute legal advice and should not be relied upon as such. For serious legal matters, consult a licensed attorney in your jurisdiction.

---

## 👨‍💻 Built By

**Parthil Barot**
B.Tech Computer Science & Engineering
Institute of Technology, Nirma University, Ahmedabad, India

Built entirely with Codex during OpenAI Build Week 2026.

---

*"The people who need this most can't afford a lawyer. Now they don't have to walk in alone."*