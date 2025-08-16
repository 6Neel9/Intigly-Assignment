import React from 'react'
import { dayLabel } from '../utils/date'

interface Props {
  date: Date
  inMonth: boolean
  isToday: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onMouseEnter: () => void
  onMouseUp: () => void
}

export default function DayCell({ date, inMonth, isToday, onMouseDown, onMouseEnter, onMouseUp }: Props) {
  return (
    <div
      className={`cell ${!inMonth ? 'dim' : ''} ${isToday ? 'today' : ''}`}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
    >
      <div className="day">{dayLabel(date)}</div>
    </div>
  )
}
