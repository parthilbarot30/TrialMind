# ⚖️ TrialMind — AI Adversarial Case Preparation

> **Know your case before you walk into court.**

TrialMind is an AI-powered legal preparation platform that deploys three simultaneous AI legal minds — your advocate, opposing counsel, and the judge — to expose every weakness in your case before the opposition does.

Built for the 5+ million pro-se litigants (self-represented individuals) in the US who face court without legal counsel every year.

---

## 🏆 OpenAI Build Week Submission

**Track:** Apps for Your Life  
**Built with:** Codex (GPT-5.6) — every route, component, and prompt architecture was written inside a single Codex session  
**Live Demo:** [https://trial-mind.vercel.app](https://trial-mind.vercel.app)  
**Demo Video:** [YouTube Link]

---

## 🎯 The Problem

There are over 5 million Americans who represent themselves in court every year — in landlord disputes, employment cases, small claims, and contract breaches. They have no lawyer. They walk in blind. They discover the weaknesses in their case when opposing counsel destroys it in front of a judge.

TrialMind changes that.

---

## ✨ Features

### Core Adversarial Engine
- **Three simultaneous AI personas** — Advocate, Opposing Counsel, and Judge each respond independently with genuinely distinct voices and reasoning styles
- **Round-by-round analysis** — submit responses to attacks and watch your case readiness score change in real time
- **Case Readiness Score** — 0–100 score with delta indicator showing exactly how each response strengthened or weakened your position

### Jurisdiction-Aware Analysis
- **8 US state jurisdictions** — California, New York, Texas, Florida, Illinois, Georgia, Washington, and General US
- **State-specific law** — applicable statutes cited in every analysis (e.g. California Civil Code 1950.5 for landlord cases)
- **Relevant case law** — real legal precedents referenced with specific relevance to your case type

### Evidence & Preparation Tools
- **Auto-checking evidence checklist** — AI detects evidence mentioned in your case description and responses, automatically marking items as secured
- **Priority-ranked checklist** — HIGH / MED / LOW priority ratings for each evidence item
- **Score progression graph** — SVG timeline showing case strength across all rounds
- **Case law references panel** — collapsible panel showing applicable statutes and precedents

### Court-Ready Documents
- **Opening Statement Generator** — court-ready 3-paragraph opening statement synthesized from your full analysis, written in first person for oral delivery
- **Opposing Counsel's Closing Argument** — see exactly what the opposition will argue before you walk in
- **Day-of-Court Preparation Checklist** — what to bring, what to wear, courtroom conduct, what NOT to do
- **PDF Export** — full session report including all rounds, evidence checklist, opening statement, closing argument preview, and legal disclaimer

### User Accounts & Persistence
- **Full authentication** — email/password signup with email confirmation
- **Case dashboard** — all saved cases with case type, date, and round count
- **Session persistence** — every round, checklist state, and opening statement saved to database
- **Guest mode** — use without an account, no data saved

### 5 Case Types
1. 🏠 Landlord Dispute — security deposit, eviction, habitability
2. 💼 Employment — wrongful termination, unpaid wages, discrimination
3. ⚖️ Small Claims — debt, property damage, fraud
4. 📄 Contract Breach — non-payment, failed delivery
5. ✳️ Other — any civil dispute

---

## 🤖 How Codex & GPT-5.6 Were Used

TrialMind was built entirely inside a single Codex session. Here's specifically where Codex and the underlying model drove the implementation:

### Codex as the Building Tool
Every file in this repository was written using Codex:
- The entire FastAPI backend including all routes, prompt architecture, and JSON parsing logic
- The complete React frontend including all components, state management, and Supabase integration
- The Supabase SQL schema and RLS policies
- The jsPDF export pipeline

### GPT-5.6 as the Runtime Engine
The deployed application uses the Groq API (OpenAI-compatible) with Llama 3.3 70B as the inference backend, designed to be swapped to GPT-5.6 via a single environment variable change. The model powers:

**Three-Persona Architecture**
Each persona has a carefully engineered system prompt that forces genuinely distinct reasoning styles:
- Advocate: constructive, evidence-focused, jurisdiction-aware
- Opposing Counsel: aggressive, targets procedural gaps, cites missing evidence
- Judge: neutral, probing, focused on burden of proof

**Jurisdiction-Aware Prompting**
State-specific law and case precedents are injected into every prompt as context, forcing the model to reason about specific statutes rather than generic legal principles.

**Auto-Check Evidence Detection**
A dedicated endpoint analyzes case descriptions and user responses to detect which evidence items have been mentioned, returning structured JSON indices for automatic checklist updates.

**Structured Output Pipeline**
Case Readiness Scores, evidence checklists, and court prep checklists all use strict JSON output formatting with fallback parsing to handle edge cases gracefully.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind-compatible CSS |
| UI | Font Awesome 6.5, Playfair Display + Inter (Google Fonts) |
| Backend | Python + FastAPI |
| AI Inference | Groq API (Llama 3.3 70B, OpenAI-compatible) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password) |
| PDF Generation | jsPDF (client-side) |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.11+
- A Groq API key (free at https://console.groq.com)
- A Supabase project (free at https://supabase.com)

### 1. Clone the repository
```bash
git clone https://github.com/parthilbarot30/trialmind.git
cd trialmind
```

### 2. Backend setup
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

Start the backend:
```bash
python -m uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### 3. Database setup
Go to your Supabase project → SQL Editor → run the entire contents of `supabase/schema.sql`

### 4. Frontend setup
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

Start the frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 📁 Project Structure

```
trialmind/
├── backend/
│   ├── main.py              # FastAPI app — all routes and AI logic
│   ├── requirements.txt     # Python dependencies
│   ├── render.yaml          # Render deployment config
│   └── runtime.txt          # Python version pin
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main application — all UI components
│   │   ├── Auth.jsx         # Authentication screen
│   │   ├── Dashboard.jsx    # Case dashboard
│   │   ├── Root.jsx         # App router — auth/dashboard/app
│   │   ├── supabase.js      # Supabase client
│   │   ├── index.css        # Global styles and CSS variables
│   │   └── main.jsx         # React entry point
│   ├── index.html           # HTML template with font/FA imports
│   └── package.json
└── supabase/
    └── schema.sql           # Complete database schema with RLS
```

---

## 🗄️ Database Schema

```sql
-- Core tables
cases              -- user's saved cases
rounds             -- each analysis round per case
checklist_items    -- evidence checklist items per case
opening_statements -- generated opening statements per case
profiles           -- user profile data

-- All tables protected by Row Level Security
-- Users can only access their own data
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Initial case analysis — all three personas respond |
| POST | `/respond` | Submit user response — all three personas react |
| POST | `/opening-statement` | Generate court-ready opening statement |
| POST | `/closing-argument` | Generate opposing counsel closing + court prep |
| POST | `/auto-check` | Detect evidence mentioned in text, return checked indices |

---

## 🎬 Demo Script

The demo uses this landlord dispute scenario:

> *"My landlord kept my entire $800 security deposit after I moved out. I left the apartment clean and gave 30 days written notice via WhatsApp. I have photos from move-in but not move-out. The landlord claims there was damage but never provided an itemized list."*

**What to observe:**
1. Initial score (~51/100) and why — missing move-out documentation
2. Opposition's attack — WhatsApp notice validity, no move-out photos
3. Judge's questions — burden of proof, documentation gaps
4. Evidence checklist auto-checking items from the description
5. Submit response with new evidence — score jumps to ~70+
6. Score progression graph appears after round 2
7. Generate opening statement — court-ready 3 paragraphs
8. Generate closing argument — see exactly what opposition will argue
9. Court prep checklist — day-of preparation
10. Download PDF — full court report

---

## 🔒 Security

- All API keys stored as environment variables — never in code
- Supabase Row Level Security — users can only access their own cases
- No sensitive data stored in frontend bundle
- Guest mode available — no account required to use core features

---

## ⚠️ Legal Disclaimer

TrialMind is an AI-powered legal preparation tool designed to help individuals understand their legal position and prepare for court proceedings. It is **not a substitute for professional legal advice**. The analysis provided by TrialMind does not constitute legal advice and should not be relied upon as such. For serious legal matters, please consult a licensed attorney in your jurisdiction.

---

## 👨‍💻 Built By

**Parthil Barot**  
B.Tech Computer Science & Engineering  
Institute of Technology, Nirma University, Ahmedabad  

Built entirely with Codex during OpenAI Build Week 2026.

---

*"The people who need this most can't afford a lawyer. Now they don't have to walk in alone."*