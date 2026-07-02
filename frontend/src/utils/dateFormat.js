const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

export function formatHebrewDate(isoDate) {
  const d = new Date(isoDate)
  const day = d.getDate()
  const month = HEBREW_MONTHS[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ב${month}, ${year}`
}

export function addDays(isoDate, days) {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
