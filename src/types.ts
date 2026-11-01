export type Habit = {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  schedule: { type: 'daily' } | { type: 'weekly'; days: number[] }
  created_at: string
  archived_at: string | null
}

export type Completion = {
  id: string
  habit_id: string
  user_id: string
  completed_on: string // 'YYYY-MM-DD'
  created_at: string
}