import React from 'react'
import type { Task, Category } from "../types/taks"

interface Props {
  task: Task
  leftPct: number
  widthPct: number
  topPx: number
  dim: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onLeftHandleDown: (e: React.MouseEvent) => void
  onRightHandleDown: (e: React.MouseEvent) => void
}

const colorClass = (c: Category) =>
  c === 'To Do' ? 'bar-todo' :
  c === 'In Progress' ? 'bar-progress' :
  c === 'Review' ? 'bar-review' : 'bar-done'

export default function TaskItem({
  task, leftPct, widthPct, topPx, dim,
  onMouseDown, onLeftHandleDown, onRightHandleDown
}: Props) {
  return (
    <div
      className={`task ${colorClass(task.category)}`}
      style={{ left: `${leftPct}%`, width: `${widthPct}%`, top: topPx, opacity: dim ? 0.25 : 1 }}
      onMouseDown={onMouseDown}
      title={`${task.name} (${task.category}) ${task.start} → ${task.end}`}
    >
      <div className="handle" data-handle onMouseDown={onLeftHandleDown} />
      <span className="pill">{task.start.slice(5)}</span>
      <span>{task.name}</span>
      <div style={{ flex: 1 }} />
      <div className="pill">{task.category}</div>
      <div className="handle" data-handle onMouseDown={onRightHandleDown} />
    </div>
  )
}
