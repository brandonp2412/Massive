export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const MONTH = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function format(iso: string) {
  const date = new Date(iso);
  const mm = MONTH[date.getMonth()];
  const dd = date.getDate().toString();
  const day = DAYS[date.getDay()];
  const isPM = date.getHours() >= 12;
  const isMidday = date.getHours() == 12;
  const hours = date.getHours() - (isPM && !isMidday ? 12 : 0);
  const time =
    [
      hours.toString().padStart(2, '0'),
      date.getMinutes().toString().padStart(2, '0'),
    ].join(':') + (isPM ? ' pm' : 'am');
  return `${day} ${dd} ${mm}, ${time}`;
}
