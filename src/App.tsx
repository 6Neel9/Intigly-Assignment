import React, { useMemo, useState } from 'react'
import CalendarGrid from './components/CalenderGrid'
import FiltersPanel, { type Filters, applyFilters } from './components/FiltersPanel'
import Modal from './components/Modal'
import type { Task, Category } from './types/taks'
import { useLocalStorage } from './hooks/useLocalStorage'
import { addDays, endOfMonth, startOfMonth } from 'date-fns'
import { fmt } from './utils/date'

function uid() { return Math.random().toString(36).slice(2,10) }

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [tasks, setTasks] = useLocalStorage<Task[]>('planner.tasks', [])
  const [filters, setFilters] = useState<Filters>({ categories: [], duration: 0, search: '' })

  // draft state when selecting cells to create
  const [draft, setDraft] = useState<null | { start: string; end: string }>(null)
  const [draftName, setDraftName] = useState('')
  const [draftCat, setDraftCat] = useState<Category>('To Do')

  const handleCreateRequest = (range: { start: string; end: string }) => {
    setDraft(range)
    setDraftName('')
    setDraftCat('To Do')
  }
  const createTask = () => {
    if (!draft) return
    setTasks(prev => [...prev, {
      id: uid(),
      name: draftName || 'Untitled',
      category: draftCat,
      start: draft.start,
      end: draft.end
    }])
    setDraft(null)
  }

  // move keeps duration
  const onMove = (id: string, newStart: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const days = Math.round((+new Date(t.end) - +new Date(t.start)) / (1000*3600*24))
      const newEnd = fmt(addDays(new Date(newStart), days))
      return { ...t, start: newStart, end: newEnd }
    }))
  }

  // resize by edge + delta days
  const onResize = (id: string, edge: 'left'|'right', delta: number) => {
    if (delta === 0) return
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      if (edge === 'left') {
        const d = addDays(new Date(t.start), delta)
        const clamped = d > new Date(t.end) ? new Date(t.end) : d
        return { ...t, start: fmt(clamped) }
      } else {
        const d = addDays(new Date(t.end), delta)
        const clamped = d < new Date(t.start) ? new Date(t.start) : d
        return { ...t, end: fmt(clamped) }
      }
    }))
  }

  const filtered = useMemo(() => applyFilters(tasks, filters), [tasks, filters])
  const filteredIds = new Set(filtered.map(t => t.id))
  const clearFilters = () => setFilters({ categories: [], duration: 0, search: '' })

  return (
    <div className="container">
      <FiltersPanel tasks={tasks} filters={filters} onChange={setFilters} onClear={clearFilters} />

      <div>
        <div className="row" style={{ marginBottom: 12, justifyContent: 'space-between' }}>
          <h2 className="title" style={{ margin: 0 }}>Month View Task Planner</h2>
          <div className="row">
            <button className="btn" onClick={() => setCurrentMonth(addDays(startOfMonth(currentMonth), -1))}>Prev</button>
            <button className="btn" onClick={() => setCurrentMonth(new Date())}>Today</button>
            <button className="btn" onClick={() => setCurrentMonth(addDays(endOfMonth(currentMonth), 1))}>Next</button>
          </div>
        </div>

        <CalendarGrid
          month={currentMonth}
          tasks={filtered}
          onCreate={handleCreateRequest}
          onMove={onMove}
          onResize={onResize}
          filteredIds={filteredIds}
        />
      </div>

      <Modal open={!!draft} onClose={() => setDraft(null)}>
        <h3 className="title" style={{ marginTop: 0 }}>Create Task</h3>
        {draft && <div className="subtle" style={{ marginBottom: 8 }}>{draft.start} → {draft.end}</div>}
        <div style={{ display: 'grid', gap: 8 }}>
          <input placeholder="Task name" value={draftName} onChange={e => setDraftName(e.target.value)} />
          <select value={draftCat} onChange={e => setDraftCat(e.target.value as Category)}>
            <option>To Do</option>
            <option>In Progress</option>
            <option>Review</option>
            <option>Completed</option>
          </select>
        </div>
        <div className="row">
          <button className="btn" onClick={() => setDraft(null)} style={{ background: '#374151' }}>Cancel</button>
          <button className="btn" onClick={createTask}>Create</button>
        </div>
      </Modal>
    </div>
  )
}
