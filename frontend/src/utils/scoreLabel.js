export function getSuccessLabel(score) {
  if (score < 40) return 'נמוך'
  if (score < 70) return 'בינוני'
  return 'גבוה'
}
