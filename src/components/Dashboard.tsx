import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Habit, Completion } from '../types'
import { Island } from './Island'

export function Dashboard({ userId }: { userId: string }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [newHabitName, setNewHabitName] = useState('')
  const [loading, setLoading] = useState(true)

  // Calculate growth based on habits completed today
  const growthLevel = completions.length

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    let isCurrent = true

    async function loadData() {
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .is('archived_at', null)
        .order('created_at', { ascending: true })

      const { data: completionsData } = await supabase
        .from('completions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed_on', today)

      if (!isCurrent) return
      if (habitsData) setHabits(habitsData as Habit[])
      if (completionsData) setCompletions(completionsData as Completion[])
      setLoading(false)
    }

    void loadData()
    return () => {
      isCurrent = false
    }
  }, [today, userId])

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'habits', filter: `user_id=eq.${userId}` },
        (payload) => {
          setHabits((prev) => {
            if (prev.find((h) => h.id === payload.new.id)) return prev
            return [...prev, payload.new as Habit]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'completions', filter: `user_id=eq.${userId}` },
        (payload) => {
          setCompletions((prev) => {
            const newCompletion = payload.new as Completion
            if (prev.some((c) => c.id === newCompletion.id || c.habit_id === newCompletion.habit_id)) return prev
            return [...prev, newCompletion]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'completions', filter: `user_id=eq.${userId}` },
        (payload) => {
          setCompletions((prev) => prev.filter((c) => c.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function addHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!newHabitName.trim()) return

    const { data, error } = await supabase
      .from('habits')
      .insert([{ user_id: userId, name: newHabitName, icon: '🌱' }])
      .select()
      .single()

    if (error) {
      alert(error.message)
    } else if (data) {
      setHabits((prev) => [...prev, data as Habit])
      setNewHabitName('')
    }
  }

  async function toggleCompletion(habitId: string, isCompleted: boolean) {
    if (isCompleted) {
      setCompletions((prev) => prev.filter((c) => c.habit_id !== habitId))
    } else {
      setCompletions((prev) => [...prev, { habit_id: habitId, completed_on: today } as Completion])
    }

    if (isCompleted) {
      await supabase
        .from('completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('completed_on', today)
    } else {
      await supabase
        .from('completions')
        .insert([{ habit_id: habitId, user_id: userId, completed_on: today }])
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <p className="loading-card">Loading your island…</p>
      </div>
    )
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">🌿</span>
          <p className="brand-name">Habit Island</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="sign-out"
        >
          Sign out
        </button>
      </header>

      <section className="island-card" aria-labelledby="island-title">
        <p className="eyebrow">A little better every day</p>
        <h1 id="island-title" className="island-title">Your island is growing</h1>
        <p className="island-subtitle">Keep showing up and watch your world bloom.</p>
        <Island growthLevel={growthLevel} />
      </section>

      <section className="habits-panel" aria-labelledby="habits-title">
        <div className="habits-heading">
          <div>
            <h2 id="habits-title" className="section-title">Today's habits</h2>
            <p className="section-caption">Small steps make a big difference.</p>
          </div>
          <span className="completion-count">
            {completions.length} / {habits.length} done
          </span>
        </div>
        <div className="habit-list">
        {habits.length === 0 && (
          <p className="empty-state">Your island is waiting. Add your first habit below!</p>
        )}

        {habits.map((habit) => {
          const isCompleted = completions.some((c) => c.habit_id === habit.id)

          return (
            <div
              key={habit.id}
              className={`habit-row${isCompleted ? ' is-completed' : ''}`}
            >
              <button
                onClick={() => toggleCompletion(habit.id, isCompleted)}
                className="habit-check"
                type="button"
                aria-label={`${isCompleted ? 'Mark incomplete' : 'Complete'} ${habit.name}`}
                aria-pressed={isCompleted}
              >
                ✓
              </button>
              <span className="habit-name">
                {habit.icon} {habit.name}
              </span>
            </div>
          )
        })}
        </div>

      <form onSubmit={addHabit} className="add-habit-form">
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="New habit (e.g. Read 10 pages)"
          className="habit-input"
          aria-label="New habit name"
        />
        <button
          type="submit"
          className="add-button"
        >
          Add
        </button>
      </form>
      </section>
    </main>
  )
}
