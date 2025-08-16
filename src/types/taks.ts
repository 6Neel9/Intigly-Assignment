export type Category = 'To Do' | 'In Progress' | 'Review' | 'Completed'

export interface Task {
  id: string
  name: string
  category: Category
  start: string  // ISO yyyy-MM-dd
  end: string    // ISO yyyy-MM-dd
}
