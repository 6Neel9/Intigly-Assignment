import type { Task, Category } from '../types/taks'
import { differenceInCalendarDays, isWithinInterval } from 'date-fns'

export type DurationFilter = 0 | 7 | 14 | 21
export interface Filters {
  categories: Category[]
  duration: DurationFilter
  search: string
}

const CATS: Category[] = ['To Do','In Progress','Review','Completed']

// apply filters (used in App)
export function applyFilters(tasks: Task[], f: Filters) {
  const now = new Date()
  return tasks.filter(t => {
    if (f.categories.length && !f.categories.includes(t.category)) return false

    if (f.duration) {
      const overlapsNow =
        isWithinInterval(now, { start: new Date(t.start), end: new Date(t.end) }) ||
        withinWindow(now, t, f.duration)
      if (!overlapsNow) return false
    }

    if (f.search.trim() && !t.name.toLowerCase().includes(f.search.toLowerCase())) return false
    return true
  })
}

function withinWindow(now: Date, t: Task, days: number) {
  const d1 = differenceInCalendarDays(new Date(t.start), now)
  const d2 = differenceInCalendarDays(new Date(t.end), now)
  const min = Math.min(d1, d2)
  const max = Math.max(d1, d2)
  return min <= days && max >= -days
}

interface Props {
  tasks: Task[]
  filters: Filters
  onChange: (f: Filters) => void
  onClear: () => void
}
export default function FiltersPanel({ filters, onChange, onClear }: Props) {
  const toggleCategory = (c: Category) => {
    const categories = filters.categories.includes(c)
      ? filters.categories.filter(x => x !== c)
      : [...filters.categories, c]
    onChange({ ...filters, categories })
  }

  return (
    <aside className="card">
      <h3 className="title">Filters</h3>

      <input
        className="search"
        placeholder="Search by task name…"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />

      <div className="section">
        <div className="subtle">Categories</div>
        {CATS.map(c => (
          <label key={c} className="row">
            <input
              type="checkbox"
              checked={filters.categories.includes(c)}
              onChange={() => toggleCategory(c)}
            />
            <span>{c}</span>
          </label>
        ))}
      </div>

      <div className="section">
        <div className="subtle">Time window</div>
        {[0,7,14,21].map(d => (
          <label key={d} className="row">
            <input
              type="radio"
              name="duration"
              checked={filters.duration === d}
              onChange={() => onChange({ ...filters, duration: d as DurationFilter })}
            />
            <span>{d === 0 ? 'All tasks' : `Tasks within ${d/7} week${d>7?'s':''}`}</span>
          </label>
        ))}
      </div>

      <button className="btn" onClick={onClear}>Clear</button>

      <div style={{height:10}} />
      <div className="legend">
        <span className="chip" style={{ background: 'var(--todo)' }}>To Do</span>
        <span className="chip" style={{ background: 'var(--progress)' }}>In Progress</span>
        <span className="chip" style={{ background: 'var(--review)' }}>Review</span>
        <span className="chip" style={{ background: 'var(--done)' }}>Completed</span>
      </div>
    </aside>
  )
}
