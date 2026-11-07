export function pregnancyWeekFromDueDate(dueDate: string, today = new Date()): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dueDate)
  if (!match) throw new Error('Enter a valid due date.')
  const due = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (new Date(due).toISOString().slice(0, 10) !== dueDate) throw new Error('Enter a valid due date.')
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const daysUntilDue = Math.round((due - now) / 86400000)
  if (daysUntilDue < -14 || daysUntilDue > 280) throw new Error('Choose a due date within the pregnancy timeline.')
  return Math.max(1, Math.min(42, Math.floor(40 - daysUntilDue / 7)))
}
