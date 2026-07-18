import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import Auth from "./Auth"
import Dashboard from "./Dashboard"
import App from "./App"

export default function Root() {
  const [user, setUser]         = useState(undefined) // undefined = loading
  const [view, setView]         = useState("dashboard") // dashboard | app
  const [activeCase, setActiveCase] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) setView("dashboard")
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setView("dashboard")
    setActiveCase(null)
  }

  const handleNewCase = () => {
    setActiveCase(null)
    setView("app")
  }

  const handleOpenCase = (caseData) => {
    setActiveCase(caseData)
    setView("app")
  }

  const handleBackToDashboard = () => {
    setActiveCase(null)
    setView("dashboard")
  }

  // Loading state
  if (user === undefined) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--navy)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <i className="fa-solid fa-scale-balanced fa-beat-fade"
           style={{ color: "var(--gold)", fontSize: "32px" }} />
      </div>
    )
  }

  // Not logged in — show auth
  if (user === null) {
    return <Auth onAuth={(u) => { if (u === null) { setUser(null); setView("app") } }} />
  }

  // Logged in — show dashboard or app
  if (view === "dashboard") {
    return (
      <Dashboard
        user={user}
        onNewCase={handleNewCase}
        onOpenCase={handleOpenCase}
        onSignOut={handleSignOut}
      />
    )
  }

  return (
    <App
      user={user}
      activeCase={activeCase}
      onBackToDashboard={handleBackToDashboard}
      onSignOut={handleSignOut}
    />
  )
}