export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export function formatMonth(iso: string) {
  const date = new Date(iso)
  const dd = date.getDate().toString()
  const mm = (date.getMonth() + 1).toString()
  return `${dd}/${mm}`
}

function twelveHour(twentyFourHour: string) {
  const [hourString, minute] = twentyFourHour.split(':')
  const hour = +hourString % 24
  return (hour % 12 || 12) + ':' + minute + (hour < 12 ? ' AM' : ' PM')
}

function dayOfWeek(iso: string) {
  const date = new Date(iso)
  const day = date.getDay()
  const target = DAYS[day]
  return target.slice(0, 3)
}

/**
 * @param iso ISO formatted date, e.g. 1996-12-24T14:03:04
 * @param kind Intended format for the date, e.g. '%Y-%m-%d %H:%M'
 */
export function format(iso: string, kind: string) {
  const split = iso.split('T')
  const [year, month, day] = split[0].split('-')
  const time = twelveHour(split[1])
  switch (kind) {
    case '%Y-%m-%d %H:%M':
      return iso.replace('T', ' ').replace(/:\d{2}/, '')
    case '%Y-%m-%d':
      return split[0]
    case '%H:%M':
      return split[1].replace(/:\d{2}/, '')
    case '%d/%m/%y %h:%M %p':
      return `${day}/${month}/${year} ${time}`
    case '%d/%m %h:%M %p':
      return `${day}/${month} ${time}`
    case '%d/%m/%y':
      return `${day}/${month}/${year}`
    case '%d/%m':
      return `${day}/${month}`
    case '%h:%M %p':
      return time
    case '%A %h:%M %p':
      return dayOfWeek(iso) + ' ' + time
    default:
      return iso
  }
}
