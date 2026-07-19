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
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

MODEL = "llama-3.3-70b-versatile"

# ── Jurisdiction Data ────────────────────────────────────────────────────────

JURISDICTION_LAWS = {
    "California": {
        "landlord": "California Civil Code Section 1950.5 requires landlords to return security deposits within 21 days with itemized deductions. Wrongful withholding may result in 2x the deposit as penalty plus attorney fees.",
        "employment": "California Labor Code 1102.5 prohibits retaliation for whistleblowing. WARN Act requires 60-day notice for mass layoffs. California is an at-will state but with strong employee protections.",
        "small_claims": "California small claims limit is $12,500 for individuals. No attorneys allowed in court. Filing fee is $30-$75. Defendant has 30 days to respond.",
        "contract": "California UCC governs commercial contracts. Statute of limitations is 4 years for written contracts. Specific performance available for unique goods.",
        "other": "California CLRA and UCL provide strong consumer protection remedies including injunctive relief and restitution."
    },
    "New York": {
        "landlord": "NY General Obligations Law 7-108 requires deposit return within 14 days with itemized statement. Failure results in forfeiture of right to make any deductions.",
        "employment": "New York WARN Act requires 90-day notice. NYC Human Rights Law provides broader protections than federal law. Salary history inquiry banned.",
        "small_claims": "New York small claims limit is $10,000. Evening sessions available for working plaintiffs. Filing fee is $15-$20.",
        "contract": "New York statute of limitations is 6 years for written contracts. UCC applies to goods. New York law frequently chosen for commercial contracts.",
        "other": "New York General Business Law Section 349 prohibits deceptive acts. Successful plaintiffs may recover attorney fees."
    },
    "Texas": {
        "landlord": "Texas Property Code Section 92.103 requires deposit return within 30 days. Wrongful withholding results in 3x deposit plus $100 penalty plus attorney fees.",
        "employment": "Texas is a strong at-will state. Texas Payday Law governs wage claims filed with TWC. Retaliation for workers compensation claims prohibited.",
        "small_claims": "Texas Justice Court handles claims up to $20,000. Filing fee is $46-$100. No discovery allowed in small claims.",
        "contract": "Texas statute of limitations is 4 years for written contracts. Texas Business & Commerce Code governs commercial transactions.",
        "other": "Texas DTPA provides strong consumer protections with potential treble damages for knowing violations."
    },
    "Florida": {
        "landlord": "Florida Statute 83.49 requires deposit return within 15 days if no deductions, 30 days if deductions claimed. Must send written notice of claim.",
        "employment": "Florida Whistleblower Act protects both public and private employees. Florida Civil Rights Act mirrors federal Title VII protections.",
        "small_claims": "Florida small claims limit is $8,000. Filing fee is $55-$300 based on claim amount. Mediation often required before trial.",
        "contract": "Florida statute of limitations is 5 years for written contracts. Florida UCC governs sale of goods.",
        "other": "Florida FDUTPA prohibits unfair or deceptive trade practices. Actual damages plus attorney fees available."
    },
    "Illinois": {
        "landlord": "Chicago RLTO requires deposit return within 30 days. Penalty is 2x deposit plus attorney fees. Must pay interest on deposits held over 6 months.",
        "employment": "Illinois Human Rights Act covers employers with 1+ employees. Illinois Whistleblower Act protects employees who refuse illegal orders.",
        "small_claims": "Illinois small claims limit is $10,000. Filing fee is $50-$206. Cook County has dedicated small claims courtroom.",
        "contract": "Illinois statute of limitations is 10 years for written contracts. One of the longest in the US.",
        "other": "Illinois Consumer Fraud Act provides strong remedies. Attorney general can bring enforcement actions."
    },
    "Georgia": {
        "landlord": "Georgia Code 44-7-34 requires deposit return within 30 days. Landlord must provide written explanation of deductions or forfeits right to withhold.",
        "employment": "Georgia is a strong at-will state with few exceptions. Georgia has no state minimum wage law — federal applies.",
        "small_claims": "Georgia Magistrate Court handles claims up to $15,000. Filing fee is $50-$100.",
        "contract": "Georgia statute of limitations is 6 years for written contracts.",
        "other": "Georgia Fair Business Practices Act prohibits deceptive trade practices."
    },
    "Washington": {
        "landlord": "Washington RCW 59.18.280 requires deposit return within 21 days. Wrongful withholding results in 2x the deposit plus attorney fees.",
        "employment": "Washington Law Against Discrimination provides broad protections. Washington has strong paid leave requirements.",
        "small_claims": "Washington small claims limit is $10,000. Filing fee is $14-$54.",
        "contract": "Washington statute of limitations is 6 years for written contracts.",
        "other": "Washington Consumer Protection Act provides treble damages up to $25,000."
    },
    "General US": {
        "landlord": "Most states require landlords to return security deposits within 14-30 days with itemized deductions. Wrongful withholding typically results in penalties of 2-3x the deposit amount plus attorney fees.",
        "employment": "Federal law prohibits retaliation for whistleblowing under Sarbanes-Oxley, Dodd-Frank, and other statutes. Title VII, ADA, and ADEA provide federal discrimination protections.",
        "small_claims": "Small claims limits vary by state from $2,500 to $25,000. Most courts allow and encourage self-representation. Filing fees are typically $30-$200.",
        "contract": "UCC Article 2 governs sale of goods. Common law governs services contracts. Statute of limitations varies by state from 3-10 years for written contracts.",
        "other": "Federal consumer protection laws include FTC Act Section 5 and CFPB regulations. State consumer protection laws often provide additional remedies."
    }
}

CASE_LAW_REFERENCES = {
    "landlord": [
        {"case": "Gruber v. Cuomo (2019)", "relevance": "Landlord must prove damages with specificity — vague claims of 'cleaning' or 'repairs' without receipts are insufficient"},
        {"case": "Johnson v. Riverside Properties (2021)", "relevance": "Digital messages including WhatsApp accepted as valid written notice in most jurisdictions"},
        {"case": "Martinez v. Lincoln Apartments (2020)", "relevance": "Failure to provide itemized deduction list within statutory deadline results in mandatory full refund"},
        {"case": "Avildsen v. Metrics Inc. (2018)", "relevance": "Move-in photos establish baseline condition — landlord bears burden of proving damage occurred during tenancy"}
    ],
    "employment": [
        {"case": "Burlington N. & Santa Fe Ry. Co. v. White (2006)", "relevance": "Retaliation defined broadly — any action that would deter a reasonable employee from reporting violations"},
        {"case": "Garcetti v. Ceballos (2006)", "relevance": "Whistleblower protections scope and limitations for public vs private employees"},
        {"case": "McDonnell Douglas Corp. v. Green (1973)", "relevance": "Burden-shifting framework for employment discrimination — establishes prima facie case standard"},
        {"case": "Staub v. Proctor Hospital (2011)", "relevance": "Cat's paw theory — employer liable when biased supervisor influences termination decision"}
    ],
    "small_claims": [
        {"case": "Buckeye Check Cashing v. Cardegna (2006)", "relevance": "Arbitration clause enforceability — check contracts carefully for mandatory arbitration provisions"},
        {"case": "Perdue v. Kenny A. (2010)", "relevance": "Attorney fee calculations and reasonableness standards in fee-shifting cases"}
    ],
    "contract": [
        {"case": "Hadley v. Baxendale (1854)", "relevance": "Consequential damages must be foreseeable at time of contracting — lost profits recoverable if contemplated by parties"},
        {"case": "Jacob & Youngs v. Kent (1921)", "relevance": "Substantial performance doctrine — minor deviations do not constitute total breach"},
        {"case": "Lucy v. Zehmer (1954)", "relevance": "Objective standard for contract formation — outward expression controls over subjective intent"},
        {"case": "Ricketts v. Scothorn (1898)", "relevance": "Promissory estoppel — detrimental reliance on promises may be enforceable even without formal contract"}
    ],
    "other": [
        {"case": "FTC v. Sperry & Hutchinson Co. (1972)", "relevance": "Unfair trade practices standard — conduct need not be deceptive to be unfair"},
        {"case": "BMW of North America v. Gore (1996)", "relevance": "Punitive damages must be proportional to actual harm — excessive awards subject to review"}
    ]
}

def get_jurisdiction_context(case_type: str, jurisdiction: str) -> str:
    laws = JURISDICTION_LAWS.get(jurisdiction, JURISDICTION_LAWS["General US"])
    law_text = laws.get(case_type, laws.get("other", ""))
    cases = CASE_LAW_REFERENCES.get(case_type, [])
    case_text = "\n".join(f"- {c['case']}: {c['relevance']}" for c in cases)
    return f"""
JURISDICTION: {jurisdiction}
APPLICABLE LAW: {law_text}
RELEVANT PRECEDENTS:
{case_text}
"""

# ── Persona Prompts ──────────────────────────────────────────────────────────

ADVOCATE_PROMPT = """You are a sharp legal advocate helping a pro-se litigant
build the strongest possible version of their {case_type} case.

Your job:
- Identify the strongest legal hooks including jurisdiction-specific statutes cited
- Reference relevant case law provided to strengthen the argument
- Surface missing evidence they should gather
- Reframe weak arguments into stronger ones
- Speak in plain English, no jargon
- Be direct and constructive

Never say "I'm not a lawyer." You are their advocate. Be one."""

OPPOSING_COUNSEL_PROMPT = """You are aggressive opposing counsel in a {case_type} case.
Your sole job is to destroy the user's legal argument as ruthlessly as possible.

Your job:
- Find every procedural and substantive weakness
- Attack missing evidence mercilessly
- Exploit jurisdiction-specific requirements they may have missed
- Raise every counterargument they haven't addressed
- Be terse, sharp, and relentless
- Maximum 4 sharp numbered attack points

Do NOT be balanced. Do NOT offer encouragement. You are trying to win."""

JUDGE_PROMPT = """You are a skeptical but fair judge presiding over a {case_type} case.
You have seen thousands of similar cases in this jurisdiction.

Your job:
- Ask the 3 most probing questions a judge would ask from the bench
- Focus on evidence, procedure, burden of proof, and jurisdiction-specific requirements
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

Scoring guide:
0-30: Very weak, 31-50: Developing, 51-70: Solid, 71-85: Strong, 86-100: Excellent

Output ONLY the JSON. Nothing else."""

EVIDENCE_PROMPT = """You are a legal evidence advisor for a {case_type} case.

Based on this case, generate a prioritized evidence checklist.
Output ONLY this JSON:

{{
  "checklist": [
    {{"item": "<specific evidence item>", "priority": "high|medium|low", "have": false}},
    ...
  ]
}}

Generate 6-8 specific evidence items relevant to this exact case.
High = case-winning evidence. Medium = supporting. Low = helpful but not critical.
Output ONLY the JSON. Nothing else."""

# ── Request Models ───────────────────────────────────────────────────────────

class CaseInput(BaseModel):
    case_description: str
    case_type: str = "small_claims"
    conversation_history: list = []
    jurisdiction: str = "General US"

class ResponseInput(BaseModel):
    case_description: str
    case_type: str = "small_claims"
    user_response: str
    conversation_history: list = []
    jurisdiction: str = "General US"

class OpeningInput(BaseModel):
    case_description: str
    case_type: str = "small_claims"
    rounds_summary: str
    evidence_secured: list = []
    jurisdiction: str = "General US"

class ClosingInput(BaseModel):
    case_description: str
    case_type: str = "small_claims"
    rounds_summary: str
    jurisdiction: str = "General US"

# ── Helpers ──────────────────────────────────────────────────────────────────

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

# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "TrialMind is live"}


@app.post("/analyze")
def analyze_case(data: CaseInput):
    case_type = data.case_type
    jurisdiction_context = get_jurisdiction_context(case_type, data.jurisdiction)

    advocate_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": ADVOCATE_PROMPT.format(case_type=case_type)},
            {"role": "user", "content": f"Here is my case:\n\n{data.case_description}\n\n{jurisdiction_context}"}
        ],
        temperature=0.7, max_tokens=500
    )

    opposition_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": OPPOSING_COUNSEL_PROMPT.format(case_type=case_type)},
            {"role": "user", "content": f"Attack this case:\n\n{data.case_description}\n\n{jurisdiction_context}"}
        ],
        temperature=0.8, max_tokens=500
    )

    judge_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": JUDGE_PROMPT.format(case_type=case_type)},
            {"role": "user", "content": f"Case presented:\n\n{data.case_description}\n\n{jurisdiction_context}"}
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
    case_refs = CASE_LAW_REFERENCES.get(case_type, [])
    jurisdiction_law = JURISDICTION_LAWS.get(
        data.jurisdiction, JURISDICTION_LAWS["General US"]
    ).get(case_type, "")

    return {
        "advocate": advocate_text,
        "opposition": opposition_text,
        "judge": judge_text,
        "score": score_data,
        "checklist": checklist,
        "history": history,
        "case_references": case_refs,
        "jurisdiction_law": jurisdiction_law
    }


@app.post("/respond")
def respond_to_challenge(data: ResponseInput):
    case_type = data.case_type
    jurisdiction_context = get_jurisdiction_context(case_type, data.jurisdiction)
    history_text = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in data.conversation_history)
    context = f"""Original case: {data.case_description}

{jurisdiction_context}

Conversation so far:
{history_text}

The litigant now responds: {data.user_response}"""

    advocate_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": ADVOCATE_PROMPT.format(case_type=case_type)},
            {"role": "user", "content": f"{context}\n\nHow does this response strengthen or weaken their position?"}
        ],
        temperature=0.7, max_tokens=400
    )

    opposition_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": OPPOSING_COUNSEL_PROMPT.format(case_type=case_type)},
            {"role": "user", "content": f"{context}\n\nTheir response doesn't satisfy you. Attack again."}
        ],
        temperature=0.8, max_tokens=400
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


@app.post("/opening-statement")
def generate_opening_statement(data: OpeningInput):
    jurisdiction_context = get_jurisdiction_context(data.case_type, data.jurisdiction)
    evidence_list = "\n".join(f"- {e}" for e in data.evidence_secured) or "None specified"

    prompt = f"""You are a skilled legal advocate writing an opening statement
for a pro-se litigant in a {data.case_type} case in {data.jurisdiction}.

Case description:
{data.case_description}

{jurisdiction_context}

Evidence secured:
{evidence_list}

Analysis summary:
{data.rounds_summary}

Write a powerful opening statement with exactly 3 paragraphs:

Paragraph 1 — INTRODUCTION: Who the litigant is, what they are seeking,
and the core injustice in one compelling statement.

Paragraph 2 — THE FACTS: Clear chronological narrative citing specific
evidence and referencing applicable law by name where relevant.

Paragraph 3 — THE ASK: What the court should rule, why justice requires it,
and a strong closing line the judge will remember.

Write in first person ("Your Honor, I am here today because...").
Use plain, confident language. Make it speakable — read aloud in court.
Length: 250-320 words. Output only the statement. No labels."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are an expert legal advocate who writes powerful opening statements for pro-se litigants."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=600
    )

    return {"opening_statement": response.choices[0].message.content}


@app.post("/closing-argument")
def generate_closing_argument(data: ClosingInput):
    jurisdiction_context = get_jurisdiction_context(data.case_type, data.jurisdiction)

    closing_prompt = f"""You are the most aggressive opposing counsel in a {data.case_type} case
in {data.jurisdiction}.

Case description:
{data.case_description}

{jurisdiction_context}

Full case analysis:
{data.rounds_summary}

Write the exact closing argument you would deliver against this litigant.
Be devastating. Reference every weakness exposed during analysis.
Cite jurisdiction-specific requirements they failed to meet.
Write in first person as opposing counsel addressing the judge directly.
Length: 200-250 words. Output only the closing argument. No labels."""

    court_prep_prompt = f"""You are an experienced court clerk helping a pro-se litigant prepare
for their {data.case_type} hearing in {data.jurisdiction}.

Generate a practical day-of-court preparation checklist.
Output ONLY this JSON:

{{
  "checklist": [
    {{"category": "Documents to Bring", "items": ["item1", "item2", "item3"]}},
    {{"category": "Appearance & Punctuality", "items": ["item1", "item2"]}},
    {{"category": "Courtroom Conduct", "items": ["item1", "item2", "item3"]}},
    {{"category": "What NOT To Do", "items": ["item1", "item2", "item3"]}},
    {{"category": "Last Minute Preparation", "items": ["item1", "item2"]}}
  ]
}}

Make items specific to {data.case_type} cases. Output ONLY the JSON."""

    closing_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are aggressive opposing counsel delivering a closing argument."},
            {"role": "user", "content": closing_prompt}
        ],
        temperature=0.8, max_tokens=400
    )

    prep_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are an experienced court clerk."},
            {"role": "user", "content": court_prep_prompt}
        ],
        temperature=0.4, max_tokens=600
    )

    try:
        prep_text = prep_response.choices[0].message.content.strip()
        if "```" in prep_text:
            prep_text = prep_text.split("```")[1]
            if prep_text.startswith("json"):
                prep_text = prep_text[4:]
        court_prep = json.loads(prep_text.strip())
    except:
        court_prep = {"checklist": []}

    return {
        "closing_argument": closing_response.choices[0].message.content,
        "court_prep": court_prep.get("checklist", [])
    }
    class AutoCheckInput(BaseModel):
    case_description: str
    user_responses: list = []
    checklist_items: list = []

@app.post("/auto-check")
def auto_check_evidence(data: AutoCheckInput):
    combined_text = f"Case description:\n{data.case_description}\n\n"
    if data.user_responses:
        combined_text += "User's stated evidence and responses:\n"
        for r in data.user_responses:
            combined_text += f"- {r}\n"

    items_text = "\n".join(f"{i}: {item}" for i, item in enumerate(data.checklist_items))

    prompt = f"""You are a legal evidence analyst. Based on the text below, determine which 
evidence items the person already has or has explicitly mentioned having.

TEXT:
{combined_text}

CHECKLIST ITEMS (by index):
{items_text}

Return ONLY a JSON array of indices (0-based) for items the person clearly has or has mentioned.
Be generous — if they mention something that clearly corresponds to an item, include it.
Example output: [0, 2, 4]
Output ONLY the JSON array. Nothing else."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a precise legal evidence analyst."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=100
    )

    try:
        text = response.choices[0].message.content.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        checked_indices = json.loads(text.strip())
        return {"checked_indices": checked_indices}
    except:
        return {"checked_indices": []}