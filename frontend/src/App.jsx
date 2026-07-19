import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { supabase } from "./supabase";
const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CASE_TYPES = [
  {
    id: "landlord",
    icon: "fa-solid fa-house",
    label: "Landlord Dispute",
    desc: "Deposit, eviction, habitability",
  },
  {
    id: "employment",
    icon: "fa-solid fa-briefcase",
    label: "Employment",
    desc: "Termination, wages, discrimination",
  },
  {
    id: "small_claims",
    icon: "fa-solid fa-scale-balanced",
    label: "Small Claims",
    desc: "Debt, property damage, fraud",
  },
  {
    id: "contract",
    icon: "fa-solid fa-file-contract",
    label: "Contract Breach",
    desc: "Non-payment, failed delivery",
  },
  {
    id: "other",
    icon: "fa-solid fa-ellipsis",
    label: "Other",
    desc: "Any civil dispute",
  },
];

const PRIORITY = {
  high: {
    bg: "rgba(192,57,43,0.1)",
    border: "rgba(192,57,43,0.4)",
    color: "#e74c3c",
    label: "HIGH",
  },
  medium: {
    bg: "rgba(180,130,40,0.1)",
    border: "rgba(180,130,40,0.4)",
    color: "#c8a030",
    label: "MED",
  },
  low: {
    bg: "rgba(46,139,87,0.1)",
    border: "rgba(46,139,87,0.4)",
    color: "#2e8b57",
    label: "LOW",
  },
};

function ScoreBar({ score, prev }) {
  const color =
    score < 40
      ? "#c0392b"
      : score < 60
        ? "#c8a030"
        : score < 80
          ? "#4a7fa5"
          : "#2e8b57";
  const label =
    score < 40
      ? "Weak"
      : score < 60
        ? "Developing"
        : score < 80
          ? "Strong"
          : "Excellent";
  const diff = prev !== null ? score - prev : null;

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Case Readiness Score
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {diff !== null && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 600,
                color:
                  diff > 0 ? "#2e8b57" : diff < 0 ? "#c0392b" : "var(--muted)",
              }}
            >
              {diff > 0 ? `▲ +${diff}` : diff < 0 ? `▼ ${diff}` : "— no change"}
            </span>
          )}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "14px",
              fontWeight: 600,
              color,
            }}
          >
            {score} / 100
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              fontStyle: "italic",
            }}
          >
            — {label}
          </span>
        </div>
      </div>
      <div
        style={{
          background: "var(--navy-4)",
          borderRadius: "2px",
          height: "6px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: color,
            borderRadius: "2px",
            animation: "scoreIn 1s ease both",
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

function PersonaCard({
  title,
  icon,
  content,
  accentColor,
  bgColor,
  borderColor,
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className="persona-card card"
      style={{
        borderColor,
        background: bgColor,
        marginBottom: "1rem",
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.25rem",
          cursor: "pointer",
          borderBottom: collapsed ? "none" : `1px solid ${borderColor}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <i
            className={icon}
            style={{ color: accentColor, fontSize: "14px", width: "16px" }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "15px",
              fontWeight: 600,
              color: accentColor,
            }}
          >
            {title}
          </span>
        </div>
        <i
          className={`fa-solid ${collapsed ? "fa-chevron-down" : "fa-chevron-up"}`}
          style={{ color: "var(--muted)", fontSize: "11px" }}
        />
      </div>
      {!collapsed && (
        <div
          style={{
            padding: "1.25rem",
            fontSize: "14px",
            color: "#c8d0e0",
            lineHeight: "1.85",
            whiteSpace: "pre-wrap",
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

function EvidenceChecklist({ checklist, onToggle }) {
  const have = checklist.filter((i) => i.have).length;
  return (
    <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <i
            className="fa-solid fa-clipboard-list"
            style={{ color: "var(--gold)", fontSize: "13px" }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--gold)",
            }}
          >
            Evidence Checklist
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--muted)",
          }}
        >
          {have} / {checklist.length} secured
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {checklist.map((item, i) => {
          const p = PRIORITY[item.priority] || PRIORITY.low;
          return (
            <div
              key={i}
              className="checklist-item"
              onClick={() => onToggle(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "9px 10px",
                background: item.have ? "rgba(46,139,87,0.07)" : "transparent",
                border: item.have
                  ? "1px solid rgba(46,139,87,0.2)"
                  : "1px solid transparent",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "2px",
                  flexShrink: 0,
                  border: `1.5px solid ${item.have ? "#2e8b57" : "var(--muted)"}`,
                  background: item.have ? "#2e8b57" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.have && (
                  <i
                    className="fa-solid fa-check"
                    style={{ color: "#fff", fontSize: "10px" }}
                  />
                )}
              </div>
              <span
                style={{
                  flex: 1,
                  fontSize: "14px",
                  lineHeight: "1.5",
                  color: item.have ? "var(--muted)" : "#c8d0e0",
                  textDecoration: item.have ? "line-through" : "none",
                }}
              >
                {item.item}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  padding: "2px 7px",
                  borderRadius: "2px",
                  background: p.bg,
                  color: p.color,
                  border: `1px solid ${p.border}`,
                }}
              >
                {p.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoundDivider({ label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        margin: "2rem 0 1.5rem",
      }}
    >
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <i
          className="fa-solid fa-scale-balanced"
          style={{ color: "var(--gold)", fontSize: "12px" }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--gold)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <i
          className="fa-solid fa-scale-balanced"
          style={{ color: "var(--gold)", fontSize: "12px" }}
        />
      </div>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
    </div>
  );
}

function RoundBlock({ round, userResponse, prevScore }) {
  return (
    <div className="round-block">
      <RoundDivider label={round.label} />

      {userResponse && (
        <div
          className="card"
          style={{
            borderColor: "rgba(74,127,165,0.3)",
            background: "rgba(74,127,165,0.06)",
            padding: "1.25rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <i
              className="fa-solid fa-user"
              style={{ color: "#4a7fa5", fontSize: "12px" }}
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "14px",
                fontWeight: 600,
                color: "#4a7fa5",
              }}
            >
              Your Response
            </span>
          </div>
          <div
            style={{ fontSize: "14px", color: "#c8d0e0", lineHeight: "1.75" }}
          >
            {userResponse}
          </div>
        </div>
      )}

      <ScoreBar score={round.score.score} prev={prevScore} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "1.25rem",
        }}
      >
        <div
          className="card"
          style={{
            borderColor: "rgba(46,139,87,0.3)",
            background: "rgba(46,139,87,0.07)",
            padding: "1rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "#2e8b57",
              letterSpacing: "0.1em",
              marginBottom: "6px",
            }}
          >
            <i
              className="fa-solid fa-shield-halved"
              style={{ marginRight: "6px" }}
            />
            STRONGEST POINT
          </div>
          <div
            style={{ fontSize: "13px", color: "#c8d0e0", lineHeight: "1.6" }}
          >
            {round.score.verdict}
          </div>
        </div>
        <div
          className="card"
          style={{
            borderColor: "rgba(192,57,43,0.3)",
            background: "rgba(192,57,43,0.07)",
            padding: "1rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "#e74c3c",
              letterSpacing: "0.1em",
              marginBottom: "6px",
            }}
          >
            <i
              className="fa-solid fa-triangle-exclamation"
              style={{ marginRight: "6px" }}
            />
            CRITICAL GAP
          </div>
          <div
            style={{ fontSize: "13px", color: "#c8d0e0", lineHeight: "1.6" }}
          >
            {round.score.critical_gap}
          </div>
        </div>
      </div>

      <PersonaCard
        title="Your Advocate"
        icon="fa-solid fa-shield-halved"
        content={round.advocate}
        accentColor="#4a7fa5"
        bgColor="rgba(74,127,165,0.06)"
        borderColor="rgba(74,127,165,0.25)"
      />
      <PersonaCard
        title="Opposing Counsel"
        icon="fa-solid fa-gavel"
        content={round.opposition}
        accentColor="#c0392b"
        bgColor="rgba(192,57,43,0.06)"
        borderColor="rgba(192,57,43,0.25)"
      />
      <PersonaCard
        title="The Judge"
        icon="fa-solid fa-landmark"
        content={round.judge}
        accentColor="#7c5cbf"
        bgColor="rgba(124,92,191,0.06)"
        borderColor="rgba(124,92,191,0.25)"
      />
    </div>
  );
}

export default function App({
  user,
  activeCase,
  onBackToDashboard,
  onSignOut,
}) {
  const [currentCaseId, setCurrentCaseId] = useState(activeCase?.id || null);
  const [openingStatement, setOpeningStatement] = useState("");
  const [loadingOpening, setLoadingOpening] = useState(false);
  const [caseText, setCaseText] = useState("");
  const [caseType, setCaseType] = useState("landlord");
  const [userResponse, setUserResponse] = useState("");
  const [rounds, setRounds] = useState([]);
  const [userResponses, setUserResponses] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);
  const [jurisdiction, setJurisdiction] = useState("General US");
  const [caseReferences, setCaseReferences] = useState([]);
  const [jurisdictionLaw, setJurisdictionLaw] = useState("");
  const [closingArgument, setClosingArgument] = useState("");
  const [courtPrep, setCourtPrep] = useState([]);
  const [loadingClosing, setLoadingClosing] = useState(false);

  useEffect(() => {
    if (rounds.length > 0)
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rounds]);
  useEffect(() => {
    if (activeCase) loadCase(activeCase);
  }, [activeCase]);

  const loadCase = async (caseData) => {
    setCaseText(caseData.case_description);
    setCaseType(caseData.case_type);
    setCurrentCaseId(caseData.id);
    setStarted(true);

    const [
      { data: roundsData },
      { data: checklistData },
      { data: openingData },
    ] = await Promise.all([
      supabase
        .from("rounds")
        .select("*")
        .eq("case_id", caseData.id)
        .order("round_number"),
      supabase
        .from("checklist_items")
        .select("*")
        .eq("case_id", caseData.id)
        .order("created_at"),
      supabase
        .from("opening_statements")
        .select("*")
        .eq("case_id", caseData.id)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    if (roundsData?.length > 0) {
      const loadedRounds = roundsData.map((r) => ({
        label: r.label,
        advocate: r.advocate,
        opposition: r.opposition,
        judge: r.judge,
        score: {
          score: r.score,
          verdict: r.verdict,
          critical_gap: r.critical_gap,
        },
      }));
      const loadedResponses = roundsData
        .filter((r) => r.user_response)
        .map((r) => r.user_response);
      setRounds(loadedRounds);
      setUserResponses(loadedResponses);
      setHistory(
        roundsData
          .map((r) => [
            { role: "advocate", content: r.advocate },
            { role: "opposition", content: r.opposition },
            { role: "judge", content: r.judge },
          ])
          .flat(),
      );
    }

    // Fix: load checklist with correct have values from database
    if (checklistData && checklistData.length > 0) {
      setChecklist(
        checklistData.map((item) => ({
          id: item.id,
          item: item.item,
          priority: item.priority,
          have: item.have, // ← this was the bug, now explicitly loaded
        })),
      );
    }

    if (openingData?.[0]) setOpeningStatement(openingData[0].content);
  };
  const autoCheckEvidence = async (caseDesc, responses, currentChecklist) => {
    if (!currentChecklist.length) return currentChecklist;

    try {
      const res = await axios.post(`${API}/auto-check`, {
        case_description: caseDesc,
        user_responses: responses,
        checklist_items: currentChecklist.map((i) => i.item),
      });

      const checkedIndices = res.data.checked_indices || [];
      if (!checkedIndices.length) return currentChecklist;

      const updatedChecklist = currentChecklist.map((item, idx) => ({
        ...item,
        have: checkedIndices.includes(idx) ? true : item.have,
      }));

      // Save auto-checked items to Supabase
      if (user && currentCaseId) {
        const itemsToUpdate = updatedChecklist.filter(
          (item, idx) => checkedIndices.includes(idx) && item.id,
        );
        await Promise.all(
          itemsToUpdate.map((item) =>
            supabase
              .from("checklist_items")
              .update({ have: true })
              .eq("id", item.id),
          ),
        );
      }

      return updatedChecklist;
    } catch (e) {
      console.error("Auto-check failed:", e);
      return currentChecklist;
    }
  };
  const analyzeCase = async () => {
    if (!caseText.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/analyze`, {
        case_description: caseText,
        case_type: caseType,
        jurisdiction,
        conversation_history: [],
      });

      const firstRound = {
        label: "Initial Analysis",
        advocate: res.data.advocate,
        opposition: res.data.opposition,
        judge: res.data.judge,
        score: res.data.score,
      };

      let newChecklist = res.data.checklist || [];

      // Save to Supabase first to get IDs
      if (user) {
        const title =
          caseText.slice(0, 60) + (caseText.length > 60 ? "..." : "");
        const { data: caseData } = await supabase
          .from("cases")
          .insert({
            user_id: user.id,
            title,
            case_description: caseText,
            case_type: caseType,
          })
          .select()
          .single();

        if (caseData) {
          setCurrentCaseId(caseData.id);

          const [roundResult, ...checklistResults] = await Promise.all([
            supabase.from("rounds").insert({
              case_id: caseData.id,
              round_number: 1,
              label: firstRound.label,
              advocate: firstRound.advocate,
              opposition: firstRound.opposition,
              judge: firstRound.judge,
              score: firstRound.score.score,
              verdict: firstRound.score.verdict,
              critical_gap: firstRound.score.critical_gap,
            }),
            ...newChecklist.map((item) =>
              supabase
                .from("checklist_items")
                .insert({
                  case_id: caseData.id,
                  item: item.item,
                  priority: item.priority,
                  have: false,
                })
                .select()
                .single(),
            ),
          ]);

          // Attach IDs from Supabase to checklist items
          newChecklist = newChecklist.map((item, idx) => ({
            ...item,
            id: checklistResults[idx]?.data?.id || null,
            have: false,
          }));

          // Auto-check based on case description
          newChecklist = await autoCheckEvidence(caseText, [], newChecklist);
        }
      } else {
        // Guest user — auto-check without saving
        newChecklist = await autoCheckEvidence(caseText, [], newChecklist);
      }

      setRounds([firstRound]);
      setChecklist(newChecklist);
      setUserResponses([]);
      setHistory(res.data.history);
      setCaseReferences(res.data.case_references || []);
      setJurisdictionLaw(res.data.jurisdiction_law || "");
      setStarted(true);
    } catch (e) {
      alert("Backend error — is the server running?");
    }
    setLoading(false);
  };

  const submitResponse = async () => {
    if (!userResponse.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/respond`, {
        case_description: caseText,
        case_type: caseType,
        jurisdiction,
        user_response: userResponse,
        conversation_history: history,
      });

      const newRound = {
        label: `Round ${rounds.length + 1} — After Your Response`,
        advocate: res.data.advocate,
        opposition: res.data.opposition,
        judge: res.data.judge,
        score: res.data.score,
      };

      const newUserResponses = [...userResponses, userResponse];

      // Auto-check based on all responses so far
      const updatedChecklist = await autoCheckEvidence(
        caseText,
        newUserResponses,
        checklist,
      );

      setRounds((prev) => [...prev, newRound]);
      setUserResponses(newUserResponses);
      setChecklist(updatedChecklist);
      setHistory(res.data.history);
      setUserResponse("");

      // Save to Supabase
      if (user && currentCaseId) {
        await Promise.all([
          supabase.from("rounds").insert({
            case_id: currentCaseId,
            round_number: rounds.length + 1,
            label: newRound.label,
            advocate: newRound.advocate,
            opposition: newRound.opposition,
            judge: newRound.judge,
            score: newRound.score.score,
            verdict: newRound.score.verdict,
            critical_gap: newRound.score.critical_gap,
            user_response: userResponse,
          }),
          supabase
            .from("cases")
            .update({
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentCaseId),
        ]);
      }
    } catch (e) {
      alert("Backend error — is the server running?");
    }
    setLoading(false);
  };

  const toggleChecklist = async (i) => {
    const item = checklist[i];
    const newHave = !item.have;
    setChecklist((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, have: newHave } : it)),
    );
    if (user && item.id) {
      await supabase
        .from("checklist_items")
        .update({ have: newHave })
        .eq("id", item.id);
    }
  };

  const reset = () => {
    setCaseText("");
    setUserResponse("");
    setRounds([]);
    setUserResponses([]);
    setChecklist([]);
    setHistory([]);
    setStarted(false);
    setCurrentCaseId(null);
    setOpeningStatement("");
  };

  const selectedType = CASE_TYPES.find((c) => c.id === caseType);
  const exportPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "letter" });

    const MARGIN = 60;
    const PAGE_WIDTH = doc.internal.pageSize.getWidth();
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
    let y = MARGIN;

    const checkPage = (needed = 40) => {
      if (y + needed > PAGE_HEIGHT - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }
    };

    const addText = (text, fontSize, color, bold, maxWidth) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(
        String(text),
        maxWidth || CONTENT_WIDTH,
      );
      checkPage(lines.length * (fontSize * 1.5));
      doc.text(lines, MARGIN, y);
      y += lines.length * (fontSize * 1.5) + 6;
    };

    const addRule = (color = [200, 169, 110]) => {
      checkPage(20);
      doc.setDrawColor(...color);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
      y += 16;
    };

    // ── Cover ──────────────────────────────────────────────
    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

    doc.setFontSize(32);
    doc.setTextColor(200, 169, 110);
    doc.setFont("helvetica", "bold");
    doc.text("TRIALMIND", PAGE_WIDTH / 2, 200, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(220, 225, 240);
    doc.setFont("helvetica", "normal");
    doc.text("AI Adversarial Case Preparation Report", PAGE_WIDTH / 2, 228, {
      align: "center",
    });

    doc.setDrawColor(200, 169, 110);
    doc.setLineWidth(0.5);
    doc.line(MARGIN + 60, 250, PAGE_WIDTH - MARGIN - 60, 250);

    const caseTypeName =
      CASE_TYPES.find((c) => c.id === caseType)?.label || caseType;
    doc.setFontSize(12);
    doc.setTextColor(180, 190, 215);
    doc.text(`Case Type: ${caseTypeName}`, PAGE_WIDTH / 2, 278, {
      align: "center",
    });
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      PAGE_WIDTH / 2,
      298,
      { align: "center" },
    );
    doc.text(`Rounds Completed: ${rounds.length}`, PAGE_WIDTH / 2, 318, {
      align: "center",
    });

    const finalScore = rounds[rounds.length - 1]?.score;
    if (finalScore) {
      doc.setFontSize(56);
      doc.setTextColor(200, 169, 110);
      doc.setFont("helvetica", "bold");
      doc.text(`${finalScore.score}`, PAGE_WIDTH / 2, 410, { align: "center" });
      doc.setFontSize(14);
      doc.setTextColor(220, 225, 240);
      doc.setFont("helvetica", "normal");
      doc.text("Final Case Readiness Score / 100", PAGE_WIDTH / 2, 434, {
        align: "center",
      });
    }

    doc.setFontSize(10);
    doc.setTextColor(120, 130, 150);
    doc.text(
      "This report is not legal advice. Consult a licensed attorney for serious matters.",
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - 40,
      { align: "center" },
    );

    // ── Page 2: Case Summary ──────────────────────────────
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
    y = MARGIN;

    addText("CASE SUMMARY", 10, [150, 110, 50], true);
    y += 4;
    addRule();
    addText(caseText, 12, [30, 35, 50], false);
    y += 24;

    if (rounds.length > 1) {
      addText("SCORE PROGRESSION", 10, [150, 110, 50], true);
      y += 4;
      addRule();
      rounds.forEach((r) => {
        const scoreColor =
          r.score.score < 40
            ? [192, 57, 43]
            : r.score.score < 60
              ? [160, 120, 20]
              : r.score.score < 80
                ? [40, 90, 140]
                : [46, 100, 60];
        addText(`${r.label}:  ${r.score.score} / 100`, 12, scoreColor, true);
        y += 2;
      });
      y += 24;
    }

    if (checklist.length > 0) {
      addText("EVIDENCE CHECKLIST", 10, [150, 110, 50], true);
      y += 4;
      addRule();
      checklist.forEach((item) => {
        const secured = item.have;
        const color = secured ? [30, 100, 60] : [160, 40, 30];
        const status = secured ? "[SECURED]" : "[NEEDED] ";
        const priority = `[${item.priority.toUpperCase()}]`;
        addText(`${status}  ${priority}`, 10, color, true);
        y -= 8;
        addText(`   ${item.item}`, 10, [30, 35, 50], false);
        y += 4;
      });
      y += 24;
    }

    // ── Rounds ────────────────────────────────────────────
    rounds.forEach((round, i) => {
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
      y = MARGIN;

      addText(round.label.toUpperCase(), 10, [150, 110, 50], true);
      y += 4;
      addRule();

      if (userResponses[i - 1]) {
        addText("YOUR RESPONSE", 10, [40, 90, 140], true);
        y += 4;
        addText(userResponses[i - 1], 12, [30, 35, 50], false);
        y += 20;
      }

      // Score block
      const scoreColor =
        round.score.score < 40
          ? [192, 57, 43]
          : round.score.score < 60
            ? [160, 120, 20]
            : round.score.score < 80
              ? [40, 90, 140]
              : [46, 100, 60];
      addText(
        `Case Readiness Score: ${round.score.score} / 100`,
        13,
        scoreColor,
        true,
      );
      y += 4;
      addText(
        `Strongest Point: ${round.score.verdict}`,
        11,
        [30, 100, 60],
        false,
      );
      y += 4;
      addText(
        `Critical Gap: ${round.score.critical_gap}`,
        11,
        [160, 40, 30],
        false,
      );
      y += 24;

      addText("YOUR ADVOCATE", 10, [40, 90, 140], true);
      y += 4;
      addRule([40, 90, 140]);
      addText(round.advocate, 12, [30, 35, 50], false);
      y += 20;

      addText("OPPOSING COUNSEL", 10, [160, 40, 30], true);
      y += 4;
      addRule([160, 40, 30]);
      addText(round.opposition, 12, [30, 35, 50], false);
      y += 20;

      addText("THE JUDGE", 10, [90, 60, 160], true);
      y += 4;
      addRule([90, 60, 160]);
      addText(round.judge, 12, [30, 35, 50], false);
    });
    // ── Opening Statement ─────────────────────────────────
    if (openingStatement) {
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
      y = MARGIN;
      addText("OPENING STATEMENT", 10, [150, 110, 50], true);
      y += 4;
      addRule();
      addText(
        "The following statement is drafted for court delivery. Read slowly and clearly.",
        11,
        [120, 130, 150],
        false,
      );
      y += 16;
      addText(openingStatement, 13, [30, 35, 50], false);
    }
    // ── Disclaimer ────────────────────────────────────────
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
    y = MARGIN;
    addText("LEGAL DISCLAIMER", 10, [150, 110, 50], true);
    y += 4;
    addRule();
    addText(
      "TrialMind is an AI-powered legal preparation tool designed to help individuals understand their legal position and prepare for court proceedings. It is not a substitute for professional legal advice. The analysis provided by TrialMind does not constitute legal advice and should not be relied upon as such. For serious legal matters, please consult a licensed attorney in your jurisdiction.",
      12,
      [30, 35, 50],
      false,
    );

    doc.save(`TrialMind-Report-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const generateOpeningStatement = async () => {
    setLoadingOpening(true);
    try {
      const securedEvidence = checklist
        .filter((i) => i.have)
        .map((i) => i.item);
      const roundsSummary = rounds
        .map(
          (r, i) => `
Round ${i + 1}: Score ${r.score.score}/100
Strongest: ${r.score.verdict}
Gap: ${r.score.critical_gap}
Advocate: ${r.advocate.slice(0, 300)}...
    `,
        )
        .join("\n");

      const res = await axios.post(`${API}/opening-statement`, {
        case_description: caseText,
        case_type: caseType,
        rounds_summary: roundsSummary,
        evidence_secured: securedEvidence,
      });

      setOpeningStatement(res.data.opening_statement);

      if (user && currentCaseId) {
        await supabase.from("opening_statements").upsert({
          case_id: currentCaseId,
          content: res.data.opening_statement,
        });
      }
    } catch (e) {
      alert("Error generating opening statement");
    }
    setLoadingOpening(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          position: "sticky",
          top: 0,
          background: "var(--navy)",
          zIndex: 10,
        }}
      >
        <i
          className="fa-solid fa-scale-balanced"
          style={{ color: "var(--gold)", fontSize: "20px" }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "20px",
              color: "var(--white)",
            }}
          >
            TrialMind
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)" }}>
            AI Adversarial Case Preparation
          </div>
        </div>
        {checklist.length > 0 && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--muted)",
            }}
          >
            <i
              className="fa-solid fa-clipboard-check"
              style={{ color: "var(--gold)", marginRight: "6px" }}
            />
            {checklist.filter((i) => i.have).length}/{checklist.length} evidence
            secured
          </div>
        )}
        {user && onBackToDashboard && (
          <button
            className="btn-secondary"
            onClick={onBackToDashboard}
            style={{ padding: "6px 14px", fontSize: "12px" }}
          >
            <i
              className="fa-solid fa-arrow-left"
              style={{ marginRight: "6px" }}
            />
            My Cases
          </button>
        )}
        {started && (
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            Done?{" "}
            <span className="text-link" onClick={reset}>
              Start a new case
            </span>
          </span>
        )}
      </header>

      {/* Hero */}
      {!started && (
        <div style={{ textAlign: "center", padding: "4rem 1.5rem 2rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <i
              className="fa-solid fa-scale-balanced"
              style={{ color: "var(--gold)", fontSize: "48px" }}
            />
          </div>
          <div className="gold-rule" />
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              lineHeight: "1.2",
              marginBottom: "1rem",
              color: "var(--white)",
            }}
          >
            Know your case before
            <br />
            you walk into court.
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "var(--muted)",
              maxWidth: "480px",
              margin: "0 auto 0.75rem",
              lineHeight: "1.7",
              fontWeight: 300,
            }}
          >
            TrialMind deploys three AI legal minds simultaneously — your
            advocate, opposing counsel, and the judge — exposing every weakness
            before they do.
          </p>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            Used TrialMind before?{" "}
            <span
              className="text-link"
              onClick={() =>
                bottomRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Jump to your case
            </span>
          </p>
        </div>
      )}

      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "1.5rem 1.5rem 4rem",
        }}
      >
        {/* Case input card */}
        <div
          className="card"
          style={{ padding: "1.75rem", marginBottom: "1.5rem" }}
        >
          {/* Case type selector */}
          {!started && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                Case Type
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                {CASE_TYPES.slice(0, 4).map((ct) => (
                  <div
                    key={ct.id}
                    className="case-type-card"
                    onClick={() => setCaseType(ct.id)}
                    style={{
                      padding: "11px 14px",
                      border: `1px solid ${caseType === ct.id ? "var(--gold)" : "var(--border-dim)"}`,
                      background:
                        caseType === ct.id ? "var(--gold-bg)" : "transparent",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "2px",
                      }}
                    >
                      <i
                        className={ct.icon}
                        style={{
                          color:
                            caseType === ct.id ? "var(--gold)" : "var(--muted)",
                          fontSize: "12px",
                          width: "14px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color:
                            caseType === ct.id ? "var(--gold)" : "var(--white)",
                        }}
                      >
                        {ct.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--muted)",
                        paddingLeft: "22px",
                      }}
                    >
                      {ct.desc}
                    </div>
                  </div>
                ))}
              </div>
              {/* Other — text link style */}
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                  None of these?{" "}
                  <span
                    className="text-link"
                    onClick={() => setCaseType("other")}
                    style={{ fontWeight: caseType === "other" ? 600 : 400 }}
                  >
                    {caseType === "other" ? (
                      <>
                        <i
                          className="fa-solid fa-check"
                          style={{ marginRight: "5px" }}
                        />
                        Using: Other / Custom case
                      </>
                    ) : (
                      "Describe any other civil dispute"
                    )}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Locked case type display */}
          {started && selectedType && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "1rem",
              }}
            >
              <i
                className={selectedType.icon}
                style={{ color: "var(--gold)", fontSize: "13px" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--gold)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {selectedType.label}
              </span>
            </div>
          )}

          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Your Case
          </div>
          <textarea
            value={caseText}
            onChange={(e) => setCaseText(e.target.value)}
            placeholder="Describe your situation in plain language — what happened, what you want, and what evidence you have."
            disabled={started}
            style={{
              width: "100%",
              minHeight: "120px",
              background: "var(--navy-2)",
              border: "1px solid var(--border-dim)",
              borderRadius: "3px",
              padding: "14px",
              color: "var(--white)",
              fontSize: "14px",
              lineHeight: "1.7",
              fontFamily: "var(--font-body)",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              opacity: started ? 0.5 : 1,
              cursor: started ? "not-allowed" : "text",
            }}
          />

          {!started && (
            <div style={{ marginTop: "14px" }}>
              <button
                className="btn-primary"
                onClick={analyzeCase}
                disabled={loading || !caseText.trim()}
              >
                {loading ? (
                  <>
                    <i
                      className="fa-solid fa-spinner fa-spin"
                      style={{ marginRight: "8px" }}
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <i
                      className="fa-solid fa-magnifying-glass"
                      style={{ marginRight: "8px" }}
                    />
                    Analyze My Case
                  </>
                )}
              </button>
            </div>
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
          <div
            style={{
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "14px",
              padding: "2rem",
              border: "1px dashed var(--border)",
              borderRadius: "4px",
              marginTop: "1rem",
              fontStyle: "italic",
            }}
          >
            <i
              className="fa-solid fa-scale-balanced fa-beat-fade"
              style={{ color: "var(--gold)", marginRight: "10px" }}
            />
            The court is deliberating...
          </div>
        )}
        {rounds.length > 0 && !loading && (
          <div style={{ marginTop: "1.5rem" }}>
            {/* Opening Statement */}
            <div
              className="card"
              style={{ padding: "1.75rem", marginBottom: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <i
                    className="fa-solid fa-microphone-lines"
                    style={{ color: "var(--gold)", fontSize: "14px" }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "var(--gold)",
                    }}
                  >
                    Opening Statement
                  </span>
                </div>
                {!openingStatement && (
                  <button
                    className="btn-primary"
                    onClick={generateOpeningStatement}
                    disabled={loadingOpening}
                    style={{ padding: "8px 18px", fontSize: "13px" }}
                  >
                    {loadingOpening ? (
                      <>
                        <i
                          className="fa-solid fa-spinner fa-spin"
                          style={{ marginRight: "8px" }}
                        />
                        Drafting...
                      </>
                    ) : (
                      <>
                        <i
                          className="fa-solid fa-wand-magic-sparkles"
                          style={{ marginRight: "8px" }}
                        />
                        Generate
                      </>
                    )}
                  </button>
                )}
                {openingStatement && (
                  <button
                    className="btn-secondary"
                    onClick={generateOpeningStatement}
                    disabled={loadingOpening}
                    style={{ padding: "7px 14px", fontSize: "12px" }}
                  >
                    <i
                      className="fa-solid fa-rotate"
                      style={{ marginRight: "6px" }}
                    />
                    Regenerate
                  </button>
                )}
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--muted)",
                  fontStyle: "italic",
                  marginBottom: "1rem",
                }}
              >
                A court-ready opening statement synthesized from your full case
                analysis.
              </p>

              {!openingStatement && !loadingOpening && (
                <div
                  style={{
                    border: "1px dashed var(--border)",
                    borderRadius: "4px",
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: "14px",
                  }}
                >
                  <i
                    className="fa-solid fa-file-lines"
                    style={{
                      fontSize: "24px",
                      marginBottom: "10px",
                      display: "block",
                      color: "var(--gold-dim)",
                    }}
                  />
                  Complete at least one round of analysis, then generate your
                  opening statement.
                </div>
              )}

              {loadingOpening && (
                <div
                  style={{
                    border: "1px dashed var(--border)",
                    borderRadius: "4px",
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: "14px",
                    fontStyle: "italic",
                  }}
                >
                  <i
                    className="fa-solid fa-scale-balanced fa-beat-fade"
                    style={{ color: "var(--gold)", marginRight: "10px" }}
                  />
                  Drafting your opening statement...
                </div>
              )}

              {openingStatement && (
                <div
                  style={{
                    background: "var(--navy-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    padding: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "15px",
                      color: "#e8edf8",
                      lineHeight: "2",
                      fontFamily: "var(--font-body)",
                      whiteSpace: "pre-wrap",
                      fontStyle: "italic",
                    }}
                  >
                    {openingStatement}
                  </div>
                  <div
                    style={{
                      marginTop: "1.25rem",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <button
                      className="btn-secondary"
                      style={{ fontSize: "12px", padding: "7px 14px" }}
                      onClick={() =>
                        navigator.clipboard.writeText(openingStatement)
                      }
                    >
                      <i
                        className="fa-solid fa-copy"
                        style={{ marginRight: "6px" }}
                      />
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PDF Export */}
            <div style={{ textAlign: "center" }}>
              <button className="btn-secondary" onClick={exportPDF}>
                <i
                  className="fa-solid fa-file-pdf"
                  style={{ marginRight: "8px", color: "#c0392b" }}
                />
                Download Full Court Report (PDF)
              </button>
            </div>
          </div>
        )}
        {/* Response box */}
        {started && !loading && (
          <div
            className="card"
            style={{ padding: "1.75rem", marginTop: "1.5rem" }}
            ref={bottomRef}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              <i className="fa-solid fa-reply" style={{ marginRight: "8px" }} />
              Your Response
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "var(--muted)",
                marginBottom: "10px",
                fontStyle: "italic",
              }}
            >
              Address the opposition's attacks, answer the judge's questions,
              and add any new evidence.
            </p>
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Type your response here..."
              style={{
                width: "100%",
                minHeight: "100px",
                background: "var(--navy-2)",
                border: "1px solid var(--border-dim)",
                borderRadius: "3px",
                padding: "14px",
                color: "var(--white)",
                fontSize: "14px",
                lineHeight: "1.7",
                fontFamily: "var(--font-body)",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div style={{ marginTop: "14px" }}>
              <button
                className="btn-primary"
                onClick={submitResponse}
                disabled={!userResponse.trim()}
              >
                <i
                  className="fa-solid fa-paper-plane"
                  style={{ marginRight: "8px" }}
                />
                Submit Response
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Footer — add here */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: "1.5rem 2rem",
          textAlign: "center",
          marginTop: "2rem",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "var(--muted)",
            fontStyle: "italic",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <i
            className="fa-solid fa-circle-info"
            style={{ marginRight: "6px", color: "var(--gold-dim)" }}
          />
          TrialMind is not a substitute for legal advice. For serious matters,
          consult a licensed attorney in your jurisdiction.
        </p>
      </div>
    </div>
  );
}
