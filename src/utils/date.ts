import {
  addDays, endOfMonth, endOfWeek, format, isSameMonth, isToday,
  startOfMonth, startOfWeek
} from 'date-fns'

export interface DayCell {
  date: Date
  inMonth: boolean
  isToday: boolean
}

export function monthGrid(current: Date): DayCell[] {
  const start = startOfWeek(startOfMonth(current), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(current), { weekStartsOn: 0 })
  const cells: DayCell[] = []
  let d = start
  while (d <= end) {
    cells.push({ date: d, inMonth: isSameMonth(d, current), isToday: isToday(d) })
    d = addDays(d, 1)
  }
  return cells
}

export const fmt = (d: Date | string) => format(new Date(d), 'yyyy-MM-dd')
export const dayLabel = (d: Date) => format(d, 'd')
export const weekHeader = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
