import { useSession } from './lib/useSession'
import { AuthScreen } from '../src/components/authScreen'

export default function App() {
  const { session, loading } = useSession()

  if (loading) return <div className="p-8">Loading…</div>
  if (!session) return <AuthScreen />
  return <div className="p-8">Signed in as {session.user.email}</div>
}