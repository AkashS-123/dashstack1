/** Date helpers that work on local "YYYY-MM-DD" keys so time zones never shift a day. */
export const toKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const fromKey = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)

/** Monday-based start of the week. */
export const startOfWeek = (date) => addDays(date, -((date.getDay() + 6) % 7))

export const formatTime = (time) => {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}.${String(m).padStart(2, '0')} ${suffix}`
}

const long = (date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

/** "16 October 2019 at 5.00 PM" / "20-22 October 2019 at 8.00 PM" */
export function formatEventWhen(event) {
  const start = fromKey(event.date)
  const end = fromKey(event.endDate || event.date)
  let range = long(start)
  if (event.endDate && event.endDate !== event.date) {
    range =
      start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
        ? `${start.getDate()}-${long(end)}`
        : `${long(start)} - ${long(end)}`
  }
  return event.time ? `${range} at ${formatTime(event.time)}` : range
}
