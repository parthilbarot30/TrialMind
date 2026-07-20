import { useState, useEffect } from "react"
import { supabase } from "./supabase"

export default function Dashboard({ user, onNewCase, onOpenCase, onSignOut }) {
  const [cases, setCases] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: casesData }, { data: profileData }] = await Promise.all([
      supabase.from("cases").select("*, rounds(count)").order("updated_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).single()
    ])
    setCases(casesData || [])
    setProfile(profileData)
    setLoading(false)
  }

  const deleteCase = async (caseId) => {
    if (!confirm("Delete this case? This cannot be undone.")) return
    await supabase.from("cases").delete().eq("id", caseId)
    setCases(prev => prev.filter(c => c.id !== caseId))
  }

  const CASE_TYPE_LABELS = {
    landlord: "Landlord Dispute",
    employment: "Employment",
    small_claims: "Small Claims",
    contract: "Contract Breach",
    other: "Other"
  }

  const CASE_TYPE_ICONS = {
    landlord: "fa-house",
    employment: "fa-briefcase",
    small_claims: "fa-scale-balanced",
    contract: "fa-file-contract",
    other: "fa-ellipsis"
  }

  const CASE_TYPE_COLORS = {
    landlord: "teal",
    employment: "blue",
    small_claims: "violet",
    contract: "amber",
    other: "slate"
  }

  return (
    <div className="app-shell dashboard-shell" style={{ minHeight: "100vh", background: "var(--navy)" }}>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)", padding: "1rem 2rem",
        display: "flex", alignItems: "center", gap: "14px",
        position: "sticky", top: 0, background: "var(--navy)", zIndex: 10
      }}>
        <i className="fa-solid fa-scale-balanced" style={{ color: "var(--gold)", fontSize: "20px" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "20px", color: "var(--white)" }}>TrialMind</div>
          <div style={{ fontSize: "12px", color: "var(--muted)" }}>My Cases</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            <i className="fa-solid fa-user" style={{ marginRight: "6px", color: "var(--gold)" }} />
            {profile?.full_name || user.email}
          </span>
          <button className="btn-secondary" onClick={onSignOut} style={{ padding: "6px 14px", fontSize: "12px" }}>
            <i className="fa-solid fa-right-from-bracket" style={{ marginRight: "6px" }} />
            Sign Out
          </button>
        </div>
      </header>

      <div className="dashboard-content" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* New case button */}
        <div className="dashboard-intro" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 600, color: "var(--white)", marginBottom: "4px" }}>
              Your Cases
            </h2>
            <p style={{ fontSize: "13px", color: "var(--muted)" }}>
              {cases.length === 0 ? "No cases yet" : `${cases.length} case${cases.length > 1 ? "s" : ""} on file`}
            </p>
          </div>
          <button className="btn-primary" onClick={onNewCase}>
            <i className="fa-solid fa-plus" style={{ marginRight: "8px" }} />
            New Case
          </button>
        </div>

        {/* Cases list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "24px", color: "var(--gold)", marginBottom: "1rem", display: "block" }} />
            Loading your cases...
          </div>
        ) : cases.length === 0 ? (
          <div className="card empty-case-state" style={{ padding: "4rem", textAlign: "center" }}>
            <div className="empty-case-mark" aria-hidden="true">
              <i className="fa-solid fa-scale-balanced" />
              <i className="fa-solid fa-file-lines" />
            </div>
            <span className="empty-case-eyebrow">Your private case library</span>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--white)", marginBottom: "8px" }}>
              Begin with your first case
            </h3>
            <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "1.5rem" }}>
              Capture your situation, assess the arguments, and keep your court preparation organized in one place.
            </p>
            <button className="btn-primary" onClick={onNewCase}>
              <i className="fa-solid fa-plus" style={{ marginRight: "8px" }} />
              Start Your First Case
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {cases.map(c => (
              <div key={c.id} className="card case-row" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }}
                onClick={() => onOpenCase(c)}>
                <i className={`fa-solid ${CASE_TYPE_ICONS[c.case_type] || "fa-scale-balanced"}`}
                  style={{ color: "var(--gold)", fontSize: "18px", width: "24px", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="case-row-title">
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title}
                    </div>
                    <span className={`case-type-badge ${CASE_TYPE_COLORS[c.case_type] || "slate"}`}>
                      {CASE_TYPE_LABELS[c.case_type] || "Other"}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", display: "flex", gap: "14px" }}>
                    <span><i className="fa-solid fa-clock" style={{ marginRight: "5px" }} />{new Date(c.updated_at).toLocaleDateString()}</span>
                    <span><i className="fa-solid fa-rotate" style={{ marginRight: "5px" }} />{c.rounds?.[0]?.count || 0} rounds</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                    onClick={e => { e.stopPropagation(); onOpenCase(c) }}
                  >
                    <i className="fa-solid fa-arrow-right" style={{ marginRight: "6px" }} />
                    Open
                  </button>
                  <button
                    style={{ background: "transparent", border: "1px solid rgba(192,57,43,0.3)", borderRadius: "3px", padding: "6px 10px", cursor: "pointer", color: "#e74c3c", fontSize: "12px" }}
                    onClick={e => { e.stopPropagation(); deleteCase(c.id) }}
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
