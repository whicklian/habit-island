import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)

    const { error } =
      mode === 'signup'
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } }, // <- trigger reads this
          })
        : await supabase.auth.signInWithPassword({ email, password })

    setBusy(false)
    if (error) setError(error.message)
  }

  return (
    <div className="mx-auto mt-24 max-w-sm space-y-4 p-6">
      <h1 className="text-2xl font-bold">Habit Island</h1>
      <form onSubmit={submit} className="space-y-3">
        {mode === 'signup' && (
          <input
            className="w-full rounded border p-2"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          className="w-full rounded border p-2"
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded border p-2"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button
          className="w-full rounded bg-emerald-600 p-2 text-white disabled:opacity-50"
          disabled={busy}
        >
          {busy ? '…' : mode === 'signup' ? 'Sign up' : 'Sign in'}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        className="text-sm text-emerald-700 underline"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin' ? 'Need an account?' : 'Have an account?'}
      </button>
    </div>
  )
}