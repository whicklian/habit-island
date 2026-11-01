import { useSession } from './lib/useSession'
import { AuthScreen } from '../src/components/authScreen'
import { Dashboard } from '../src/components/Dashboard'

export default function App() {
  const { session, loading } = useSession()

  if (loading) return <div className="p-8 text-center">Loading…</div>
  if (!session) return <AuthScreen />
  
  return <Dashboard userId={session.user.id} />
}