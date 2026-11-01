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
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark" aria-hidden="true">🌿</span>
          <h1 className="auth-title">Habit Island</h1>
          <p className="auth-subtitle">Grow a little every day.</p>
        </div>
      <form onSubmit={submit} className="auth-form">
        {mode === 'signup' && (
          <input
            className="habit-input"
            placeholder="Username"
            aria-label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          className="habit-input"
          type="email"
          placeholder="Email address"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="habit-input"
          type="password"
          placeholder="Password"
          aria-label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button
          className="auth-submit"
          disabled={busy}
        >
          {busy ? '…' : mode === 'signup' ? 'Sign up' : 'Sign in'}
        </button>
      </form>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button
        className="auth-switch"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        type="button"
      >
        {mode === 'signin' ? 'Need an account?' : 'Have an account?'}
      </button>
      </section>
    </main>
  )
}