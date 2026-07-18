from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

MODEL = "llama-3.3-70b-versatile"

CASE_CONTEXTS = {
    "landlord": "security deposit disputes, habitability issues, wrongful eviction, lease violations",
    "employment": "wrongful termination, unpaid wages, workplace discrimination, hostile work environment",
    "small_claims": "property damage, unpaid debts, contractor disputes, consumer fraud",
    "contract": "breach of contract, non-payment for services, failed delivery of goods, misrepresentation"
}

ADVOCATE_PROMPT = """You are a sharp legal advocate helping a pro-se litigant 
(someone representing themselves in court) build the strongest possible version 
of their case in a {case_type} dispute.

Your job:
- Identify the strongest legal hooks in their position
- Surface missing evidence they should gather
- Reframe weak arguments into stronger ones
- Speak in plain English, no jargon
- Be direct and constructive, not reassuring

Never say "I'm not a lawyer." You are their advocate. Be one."""

OPPOSING_COUNSEL_PROMPT = """You are aggressive opposing counsel in a {case_type} case. 
Your sole job is to destroy the user's legal argument as ruthlessly as possible.

Your job:
- Find every procedural weakness specific to {case_type} cases
- Attack missing evidence mercilessly
- Expose logical gaps in their reasoning
- Raise every counterargument they haven't addressed
- Be terse, sharp, and relentless

Do NOT be balanced. Do NOT offer encouragement. You are trying to win.
Maximum 4 sharp attack points."""

JUDGE_PROMPT = """You are a skeptical but fair judge presiding over a {case_type} case 
in a small claims or civil court. You have seen thousands of similar cases.

Your job:
- Ask the 3 most probing questions a judge would ask from the bench
- Focus on evidence, procedure, and burden of proof specific to {case_type} disputes
- Be neutral but penetrating
- Questions only — no statements, no rulings

Format: numbered list of exactly 3 questions. Nothing else."""

SCORE_PROMPT = """You are a legal case evaluator for a {case_type} dispute. 
Based on the case and conversation, output ONLY this JSON:

{{
  "score": <integer 0-100>,
  "verdict": "<one sentence — strongest point>",
  "critical_gap": "<one sentence — biggest weakness>"
}}

Scoring:
0-30: Very weak, 31-50: Developing, 51-70: Solid, 71-85: Strong, 86-100: Excellent

Output ONLY the JSON. Nothing else."""

EVIDENCE_PROMPT = """You are a legal evidence advisor for a {case_type} case.

Based on this case description, generate a prioritized evidence checklist.
Output ONLY this JSON:

{{
  "checklist": [
    {{"item": "<evidence item>", "priority": "high|medium|low", "have": false}},
    ...
  ]
}}

Generate 6-8 specific evidence items relevant to this exact case.
High priority = case-winning evidence. Low priority = supporting evidence.
Output ONLY the JSON. Nothing else."""


class CaseInput(BaseModel):
    case_description: str
    case_type: str = "small_claims"
    conversation_history: list = []

class ResponseInput(BaseModel):
    case_description: str
    case_type: str = "small_claims"
    user_response: str
    conversation_history: list = []


def get_readiness_score(case_description: str, history: list, case_type: str) -> dict:
    context = f"Case: {case_description}\n\nConversation:\n"
    for msg in history:
        context += f"{msg['role'].upper()}: {msg['content']}\n"

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SCORE_PROMPT.format(case_type=case_type)},
            {"role": "user", "content": context}
        ],
        temperature=0.3,
        max_tokens=200
    )
    try:
        text = response.choices[0].message.content.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except:
        return {"score": 50, "verdict": "Case under evaluation", "critical_gap": "More information needed"}


def get_evidence_checklist(case_description: str, case_type: str) -> list:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": EVIDENCE_PROMPT.format(case_type=case_type)},
            {"role": "user", "content": f"Case: {case_description}"}
        ],
        temperature=0.4,
        max_tokens=600
    )
    try:
        text = response.choices[0].message.content.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        data = json.loads(text.strip())
        return data.get("checklist", [])
    except:
        return []


@app.get("/")
def root():
    return {"status": "TrialMind is live"}


@app.post("/analyze")
def analyze_case(data: CaseInput):
    case_type = data.case_type

    advocate_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": ADVOCATE_PROMPT.format(case_type=case_type)},
            {"role": "user", "content": f"Here is my case:\n\n{data.case_description}"}
        ],
        temperature=0.7, max_tokens=400
    )

    opposition_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": OPPOSING_COUNSEL_PROMPT.format(case_type=case_type)},
            {"role": "user", "content": f"Attack this case:\n\n{data.case_description}"}
        ],
        temperature=0.8, max_tokens=400
    )

    judge_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": JUDGE_PROMPT.format(case_type=case_type)},
            {"role": "user", "content": f"Case presented:\n\n{data.case_description}"}
        ],
        temperature=0.6, max_tokens=300
    )

    advocate_text = advocate_response.choices[0].message.content
    opposition_text = opposition_response.choices[0].message.content
    judge_text = judge_response.choices[0].message.content

    history = [
        {"role": "advocate", "content": advocate_text},
        {"role": "opposition", "content": opposition_text},
        {"role": "judge", "content": judge_text},
    ]

    score_data = get_readiness_score(data.case_description, history, case_type)
    checklist = get_evidence_checklist(data.case_description, case_type)

    return {
        "advocate": advocate_text,
        "opposition": opposition_text,
        "judge": judge_text,
        "score": score_data,
        "checklist": checklist,
        "history": history
    }


@app.post("/respond")
def respond_to_challenge(data: ResponseInput):
    case_type = data.case_type
    history_text = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in data.conversation_history)
    context = f"""Original case: {data.case_description}

Conversation so far:
{history_text}

The litigant now responds: {data.user_response}"""

    advocate_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": ADVOCATE_PROMPT.format(case_type=case_type)},
            {"role": "user", "content": f"{context}\n\nHow does this response strengthen or weaken their position?"}
        ],
        temperature=0.7, max_tokens=350
    )

    opposition_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": OPPOSING_COUNSEL_PROMPT.format(case_type=case_type)},
            {"role": "user", "content": f"{context}\n\nTheir response doesn't satisfy you. Attack again."}
        ],
        temperature=0.8, max_tokens=350
    )

    judge_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": JUDGE_PROMPT.format(case_type=case_type)},
            {"role": "user", "content": f"{context}\n\nAsk 3 follow-up questions based on their response."}
        ],
        temperature=0.6, max_tokens=250
    )

    advocate_text = advocate_response.choices[0].message.content
    opposition_text = opposition_response.choices[0].message.content
    judge_text = judge_response.choices[0].message.content

    updated_history = data.conversation_history + [
        {"role": "user", "content": data.user_response},
        {"role": "advocate", "content": advocate_text},
        {"role": "opposition", "content": opposition_text},
        {"role": "judge", "content": judge_text},
    ]

    score_data = get_readiness_score(data.case_description, updated_history, case_type)

    return {
        "advocate": advocate_text,
        "opposition": opposition_text,
        "judge": judge_text,
        "score": score_data,
        "history": updated_history
    }