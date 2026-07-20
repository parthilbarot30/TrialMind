import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import Auth from "./Auth"
import Dashboard from "./Dashboard"
import App from "./App"

export default function Root() {
  const [user, setUser]             = useState(undefined)
  const [view, setView]             = useState("dashboard")
  const [activeCase, setActiveCase] = useState(null)
  const [guest, setGuest]           = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session && !guest) setView("dashboard")
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setGuest(false)
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

  const handleGuest = () => {
    setGuest(true)
    setView("app")
  }

  // Loading
  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i className="fa-solid fa-scale-balanced fa-beat-fade" style={{ color: "var(--gold)", fontSize: "32px" }} />
      </div>
    )
  }

  // Guest mode — go straight to app
  if (guest && !user) {
    return (
      <App
        user={null}
        activeCase={null}
        onBackToDashboard={null}
        onSignOut={() => { setGuest(false); setView("dashboard") }}
      />
    )
  }

  // Not logged in — show auth
  if (!user) {
    return <Auth onAuth={handleGuest} />
  }

  // Logged in — dashboard or app
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