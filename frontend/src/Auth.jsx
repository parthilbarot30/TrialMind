import { useState } from "react"
import { supabase } from "./supabase"

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login") // login | signup
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (error) setError(error.message)
      else setMessage("Check your email to confirm your account, then log in.")
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  const handleGuest = () => onAuth(null)

  const inputStyle = {
    width: "100%", background: "var(--navy-2)",
    border: "1px solid var(--border-dim)", borderRadius: "3px",
    padding: "12px 14px", color: "var(--white)", fontSize: "14px",
    fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box"
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--navy)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "2rem"
    }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <i className="fa-solid fa-scale-balanced" style={{ color: "var(--gold)", fontSize: "40px", marginBottom: "1rem", display: "block" }} />
        <div className="gold-rule" />
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: "var(--white)", marginBottom: "6px" }}>
          TrialMind
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted)" }}>AI Adversarial Case Preparation</p>
      </div>

      {/* Card */}
      <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--white)", marginBottom: "1.5rem" }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>

        {mode === "signup" && (
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "11px", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Smith"
              style={inputStyle}
            />
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "11px", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontSize: "11px", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {error && (
          <div style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: "3px", padding: "10px 14px", marginBottom: "1rem", fontSize: "13px", color: "#e74c3c" }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "8px" }} />
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: "rgba(46,139,87,0.1)", border: "1px solid rgba(46,139,87,0.3)", borderRadius: "3px", padding: "10px 14px", marginBottom: "1rem", fontSize: "13px", color: "#2e8b57" }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: "8px" }} />
            {message}
          </div>
        )}

        <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: "100%", marginBottom: "1rem" }}>
          {loading
            ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "8px" }} />Please wait...</>
            : mode === "login" ? "Sign In" : "Create Account"
          }
        </button>

        <div style={{ textAlign: "center", fontSize: "13px", color: "var(--muted)", marginBottom: "1rem" }}>
          {mode === "login" ? (
            <>No account? <span className="text-link" onClick={() => setMode("signup")}>Create one</span></>
          ) : (
            <>Already have an account? <span className="text-link" onClick={() => setMode("login")}>Sign in</span></>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--border-dim)", paddingTop: "1rem", textAlign: "center" }}>
          <span className="text-link" onClick={handleGuest} style={{ fontSize: "12px", color: "var(--muted)" }}>
            Continue without an account →
          </span>
        </div>
      </div>

      <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "1.5rem", fontStyle: "italic" }}>
        <i className="fa-solid fa-lock" style={{ marginRight: "6px" }} />
        Your case data is encrypted and private.
      </p>
    </div>
  )
}