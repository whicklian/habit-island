import { useSession } from './lib/useSession'
import { AuthScreen } from '../src/components/authScreen'
import { Dashboard } from '../src/components/Dashboard'

export default function App() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <div className="loading-screen">
        <p className="loading-card">Loading your island…</p>
      </div>
    )
  }
  if (!session) return <AuthScreen />
  
  return <Dashboard userId={session.user.id} />
}