import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Habit, Completion } from '../types'

export function Dashboard({ userId }: { userId: string }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [newHabitName, setNewHabitName] = useState('')
  const [loading, setLoading] = useState(true)

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchData()
  }, [userId])

  async function fetchData() {
    setLoading(true)
    // Fetch active habits
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .is('archived_at', null)
      .order('created_at', { ascending: true })

    // Fetch completions for today
    const { data: completionsData } = await supabase
      .from('completions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed_on', today)

    if (habitsData) setHabits(habitsData as Habit[])
    if (completionsData) setCompletions(completionsData as Completion[])
    setLoading(false)
  }

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
      setHabits([...habits, data as Habit])
      setNewHabitName('')
    }
  }

  async function toggleCompletion(habitId: string, isCompleted: boolean) {
    // Optimistic UI update (makes it feel instant)
    if (isCompleted) {
      setCompletions(completions.filter(c => c.habit_id !== habitId))
    } else {
      // fake a completion object for the UI
      setCompletions([...completions, { habit_id: habitId, completed_on: today } as Completion])
    }

    // Actually talk to the database
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

  if (loading) return <div className="p-8">Loading habits...</div>

  return (
    <div className="mx-auto max-w-md p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Today</h1>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          Sign out
        </button>
      </header>

      {/* Habit List */}
      <div className="space-y-3">
        {habits.length === 0 && (
          <p className="text-slate-500 text-center py-4">No habits yet. Add one below!</p>
        )}
        
        {habits.map((habit) => {
          const isCompleted = completions.some((c) => c.habit_id === habit.id)
          
          return (
            <div 
              key={habit.id} 
              className="flex items-center gap-4 rounded-lg border p-4 bg-white shadow-sm"
            >
              <button
                onClick={() => toggleCompletion(habit.id, isCompleted)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-slate-300 text-transparent hover:border-emerald-500'
                }`}
              >
                ✓
              </button>
              <span className={`text-lg ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {habit.icon} {habit.name}
              </span>
            </div>
          )
        })}
      </div>

      {/* Add Habit Form */}
      <form onSubmit={addHabit} className="flex gap-2 pt-4">
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="New habit (e.g. Read 10 pages)"
          className="flex-1 rounded border p-2"
        />
        <button 
          type="submit"
          className="rounded bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
        >
          Add
        </button>
      </form>
    </div>
  )
}