import { useState, useEffect, useRef } from "react"
import axios from "axios"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

const CASE_TYPES = [
  { id: "landlord", label: "🏠 Landlord Dispute", desc: "Security deposit, eviction, habitability" },
  { id: "employment", label: "💼 Employment", desc: "Wrongful termination, unpaid wages" },
  { id: "small_claims", label: "⚖️ Small Claims", desc: "Debt, property damage, fraud" },
  { id: "contract", label: "📄 Contract Breach", desc: "Non-payment, failed delivery" },
  { id: "other", label: "✳️ Other", desc: "Any civil dispute not listed above" },
]

const PRIORITY_COLORS = {
  high: { bg: "#1f0d0d", border: "#991b1b", text: "#f87171", label: "HIGH" },
  medium: { bg: "#1a1400", border: "#854d0e", text: "#fbbf24", label: "MED" },
  low: { bg: "#0d1f12", border: "#166534", text: "#4ade80", label: "LOW" },
}

const ScoreBar = ({ score, prev }) => {
  const color = score < 40 ? "#ef4444" : score < 60 ? "#f59e0b" : score < 80 ? "#3b82f6" : "#22c55e"
  const label = score < 40 ? "Weak" : score < 60 ? "Developing" : score < 80 ? "Strong" : "Excellent"
  const diff = prev !== null ? score - prev : null

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", alignItems: "center" }}>
        <span style={{ fontSize: "13px", color: "#6b7280" }}>Case Readiness</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {diff !== null && (
            <span style={{
              fontSize: "12px", fontWeight: 600,
              color: diff > 0 ? "#22c55e" : diff < 0 ? "#ef4444" : "#6b7280"
            }}>
              {diff > 0 ? `↑ +${diff}` : diff < 0 ? `↓ ${diff}` : "→ no change"}
            </span>
          )}
          <span style={{ fontSize: "13px", fontWeight: 700, color }}>{score}/100 — {label}</span>
        </div>
      </div>
      <div style={{ background: "#1f2937", borderRadius: "999px", height: "10px", overflow: "hidden" }}>
        <div style={{
          width: `${score}%`, height: "100%", background: color,
          borderRadius: "999px", transition: "width 1s ease"
        }} />
      </div>
    </div>
  )
}

const PersonaCard = ({ title, icon, content, borderColor, bgColor }) => {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div style={{
      background: bgColor, border: `1px solid ${borderColor}`,
      borderRadius: "12px", marginBottom: "1rem", overflow: "hidden"
    }}>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "1rem 1.25rem", cursor: "pointer"
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: borderColor }}>
          {icon} {title}
        </span>
        <span style={{ color: "#6b7280", fontSize: "12px" }}>{collapsed ? "▼ show" : "▲ hide"}</span>
      </div>
      {!collapsed && (
        <div style={{
          padding: "0 1.25rem 1.25rem",
          fontSize: "14px", color: "#d1d5db", lineHeight: "1.8", whiteSpace: "pre-wrap"
        }}>
          {content}
        </div>
      )}
    </div>
  )
}

const EvidenceChecklist = ({ checklist, onToggle }) => (
  <div style={{
    background: "#161b27", border: "1px solid #1f2937",
    borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem"
  }}>
    <div style={{ fontSize: "13px", fontWeight: 600, color: "#9ca3af", marginBottom: "12px" }}>
      📋 EVIDENCE CHECKLIST
    </div>
    {checklist.map((item, i) => {
      const p = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.low
      return (
        <div key={i} onClick={() => onToggle(i)} style={{
          display: "flex", alignItems: "flex-start", gap: "10px",
          padding: "8px 10px", borderRadius: "8px", cursor: "pointer",
          marginBottom: "4px", background: item.have ? "#0d1f12" : "transparent",
          border: item.have ? "1px solid #166534" : "1px solid transparent",
          transition: "all 0.2s"
        }}>
          <div style={{
            width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0,
            border: `1.5px solid ${item.have ? "#22c55e" : "#374151"}`,
            background: item.have ? "#22c55e" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginTop: "1px"
          }}>
            {item.have && <span style={{ color: "#000", fontSize: "11px", fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{
            fontSize: "14px", color: item.have ? "#6b7280" : "#d1d5db",
            textDecoration: item.have ? "line-through" : "none", flex: 1,
            lineHeight: "1.5"
          }}>
            {item.item}
          </span>
          <span style={{
            fontSize: "10px", fontWeight: 700, padding: "2px 6px",
            borderRadius: "4px", background: p.bg, color: p.text,
            border: `1px solid ${p.border}`, flexShrink: 0
          }}>
            {p.label}
          </span>
        </div>
      )
    })}
  </div>
)

const RoundBlock = ({ round, userResponse, prevScore }) => (
  <div style={{ marginBottom: "2rem" }}>
    <div style={{
      fontSize: "11px", fontWeight: 600, color: "#6b7280",
      letterSpacing: "0.08em", marginBottom: "1.25rem",
      display: "flex", alignItems: "center", gap: "10px"
    }}>
      <div style={{ flex: 1, height: "1px", background: "#1f2937" }} />
      {round.label}
      <div style={{ flex: 1, height: "1px", background: "#1f2937" }} />
    </div>

    {userResponse && (
      <div style={{
        background: "#0f1f2e", border: "1px solid #1e3a5f",
        borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem"
      }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#60a5fa", marginBottom: "8px" }}>
          👤 Your Response
        </div>
        <div style={{ fontSize: "14px", color: "#d1d5db", lineHeight: "1.7" }}>
          {userResponse}
        </div>
      </div>
    )}

    <ScoreBar score={round.score.score} prev={prevScore} />

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
      {CASE_TYPES.slice(0, 4).map(ct => (
        <div key={ct.id} onClick={() => setCaseType(ct.id)} style={{
          padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
          border: `1px solid ${caseType === ct.id ? "#3b82f6" : "#374151"}`,
          background: caseType === ct.id ? "#0c1929" : "transparent",
          transition: "all 0.15s"
        }}>
          <div style={{ fontSize: "13px", fontWeight: 500, color: caseType === ct.id ? "#60a5fa" : "#d1d5db" }}>
            {ct.label}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{ct.desc}</div>
        </div>
      ))}
      {/* Other — full width, subtle link style */}
      <div
        onClick={() => setCaseType("other")}
        style={{ gridColumn: "span 2", textAlign: "center", padding: "8px", cursor: "pointer" }}
      >
        <span style={{ fontSize: "13px", color: "#6b7280" }}>
          None of these?{" "}
          <span style={{
            color: caseType === "other" ? "#60a5fa" : "#60a5fa",
            textDecoration: "underline", textUnderlineOffset: "3px",
            fontWeight: caseType === "other" ? 600 : 400
          }}>
            {caseType === "other" ? "✓ Using: Other / Custom case" : "Describe any other civil dispute"}
          </span>
        </span>
      </div>
    </div>

    <PersonaCard title="Your Advocate" icon="🛡️" content={round.advocate}
      borderColor="#3b82f6" bgColor="#0c1929" />
    <PersonaCard title="Opposing Counsel" icon="⚔️" content={round.opposition}
      borderColor="#ef4444" bgColor="#1a0a0a" />
    <PersonaCard title="The Judge" icon="🔨" content={round.judge}
      borderColor="#a855f7" bgColor="#130d1a" />
  </div>
)

export default function App() {
  const [caseText, setCaseText] = useState("")
  const [caseType, setCaseType] = useState("landlord")
  const [userResponse, setUserResponse] = useState("")
  const [rounds, setRounds] = useState([])
  const [userResponses, setUserResponses] = useState([])
  const [checklist, setChecklist] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (rounds.length > 0) bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [rounds])

  const analyzeCase = async () => {
    if (!caseText.trim()) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/analyze`, {
        case_description: caseText,
        case_type: caseType,
        conversation_history: []
      })
      setRounds([{
        label: "ROUND 1 — INITIAL ANALYSIS",
        advocate: res.data.advocate,
        opposition: res.data.opposition,
        judge: res.data.judge,
        score: res.data.score
      }])
      setChecklist(res.data.checklist || [])
      setUserResponses([])
      setHistory(res.data.history)
      setStarted(true)
    } catch (e) {
      alert("Backend error — is the server running?")
    }
    setLoading(false)
  }

  const submitResponse = async () => {
    if (!userResponse.trim()) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/respond`, {
        case_description: caseText,
        case_type: caseType,
        user_response: userResponse,
        conversation_history: history
      })
      setRounds(prev => [...prev, {
        label: `ROUND ${prev.length + 1} — AFTER YOUR RESPONSE`,
        advocate: res.data.advocate,
        opposition: res.data.opposition,
        judge: res.data.judge,
        score: res.data.score
      }])
      setUserResponses(prev => [...prev, userResponse])
      setHistory(res.data.history)
      setUserResponse("")
    } catch (e) {
      alert("Backend error — is the server running?")
    }
    setLoading(false)
  }

  const toggleChecklist = (i) => {
    setChecklist(prev => prev.map((item, idx) =>
      idx === i ? { ...item, have: !item.have } : item
    ))
  }

  const reset = () => {
    setCaseText(""); setUserResponse(""); setRounds([])
    setUserResponses([]); setChecklist([]); setHistory([]); setStarted(false)
  }

  const haveCount = checklist.filter(i => i.have).length

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "#f9fafb", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1f2937", padding: "1rem 2rem",
        display: "flex", alignItems: "center", gap: "12px",
        position: "sticky", top: 0, background: "#0f1117", zIndex: 10
      }}>
        <span style={{ fontSize: "22px" }}>⚖️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "18px", letterSpacing: "-0.3px" }}>TrialMind</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>AI adversarial case preparation for pro-se litigants</div>
        </div>
        {checklist.length > 0 && (
          <div style={{ fontSize: "13px", color: "#6b7280" }}>
            Evidence: <span style={{ color: "#22c55e", fontWeight: 600 }}>{haveCount}/{checklist.length}</span>
          </div>
        )}
        {started && (
          <button onClick={reset} style={{
            background: "transparent", color: "#6b7280", border: "1px solid #374151",
            borderRadius: "8px", padding: "6px 14px", fontSize: "13px", cursor: "pointer"
          }}>New Case</button>
        )}
      </div>

      {/* Hero — only before start */}
      {!started && (
        <div style={{ textAlign: "center", padding: "3rem 1.5rem 1rem" }}>
          <div style={{ fontSize: "42px", marginBottom: "12px" }}>⚖️</div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "10px" }}>
            Know your case before you walk in.
          </h1>
          <p style={{ fontSize: "16px", color: "#6b7280", maxWidth: "520px", margin: "0 auto 2rem", lineHeight: "1.6" }}>
            TrialMind simulates your advocate, opposing counsel, and the judge —
            so you find the weaknesses before they do.
          </p>
          
        </div>
      )}

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "1rem 1.5rem 3rem" }}>

        {/* Case input */}
        <div style={{
          background: "#161b27", border: "1px solid #1f2937",
          borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem"
        }}>
          {/* Case type selector */}
          {!started && (
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "10px" }}>CASE TYPE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {CASE_TYPES.map(ct => (
                  <div key={ct.id} onClick={() => setCaseType(ct.id)} style={{
                    padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
                    border: `1px solid ${caseType === ct.id ? "#3b82f6" : "#374151"}`,
                    background: caseType === ct.id ? "#0c1929" : "transparent",
                    transition: "all 0.15s"
                  }}>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: caseType === ct.id ? "#60a5fa" : "#d1d5db" }}>
                      {ct.label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{ct.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "8px" }}>YOUR CASE</div>
          <textarea
            value={caseText}
            onChange={e => setCaseText(e.target.value)}
            placeholder="Describe your situation in plain language. What happened? What do you want? What evidence do you have?"
            disabled={started}
            style={{
              width: "100%", minHeight: "110px", background: "#0f1117",
              border: "1px solid #374151", borderRadius: "8px", padding: "12px",
              color: "#f9fafb", fontSize: "14px", lineHeight: "1.6",
              resize: "vertical", outline: "none", boxSizing: "border-box",
              opacity: started ? 0.5 : 1, cursor: started ? "not-allowed" : "text"
            }}
          />
          {!started && (
            <button onClick={analyzeCase} disabled={loading || !caseText.trim()} style={{
              marginTop: "12px", background: loading ? "#374151" : "#3b82f6",
              color: "#fff", border: "none", borderRadius: "8px",
              padding: "11px 28px", fontSize: "14px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s"
            }}>
              {loading ? "Analyzing your case..." : "Analyze My Case →"}
            </button>
          )}
        </div>

        {/* Evidence checklist */}
        {checklist.length > 0 && (
          <EvidenceChecklist checklist={checklist} onToggle={toggleChecklist} />
        )}

        {/* Rounds */}
        {rounds.map((round, i) => (
          <RoundBlock
            key={i}
            round={round}
            userResponse={userResponses[i - 1] || null}
            prevScore={i === 0 ? null : rounds[i - 1].score.score}
          />
        ))}

        {/* Loading between rounds */}
        {loading && rounds.length > 0 && (
          <div style={{
            textAlign: "center", color: "#6b7280", fontSize: "14px",
            padding: "2rem", border: "1px dashed #374151", borderRadius: "12px",
            marginBottom: "1.5rem"
          }}>
            ⚖️ The court is deliberating...
          </div>
        )}

        {/* Response box */}
        {started && !loading && (
          <div style={{
            background: "#161b27", border: "1px solid #374151",
            borderRadius: "16px", padding: "1.5rem"
          }} ref={bottomRef}>
            <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "8px" }}>
              YOUR RESPONSE — address the attacks, answer the judge, add new evidence
            </div>
            <textarea
              value={userResponse}
              onChange={e => setUserResponse(e.target.value)}
              placeholder="Respond to the opposition's attacks. Add new evidence. Answer the judge's questions..."
              style={{
                width: "100%", minHeight: "100px", background: "#0f1117",
                border: "1px solid #374151", borderRadius: "8px", padding: "12px",
                color: "#f9fafb", fontSize: "14px", lineHeight: "1.6",
                resize: "vertical", outline: "none", boxSizing: "border-box"
              }}
            />
            <button onClick={submitResponse} disabled={!userResponse.trim()} style={{
              marginTop: "12px",
              background: !userResponse.trim() ? "#374151" : "#7c3aed",
              color: "#fff", border: "none", borderRadius: "8px",
              padding: "11px 28px", fontSize: "14px", fontWeight: 600,
              cursor: !userResponse.trim() ? "not-allowed" : "pointer",
              transition: "background 0.2s"
            }}>
              Submit Response →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}