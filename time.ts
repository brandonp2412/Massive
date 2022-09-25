export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function formatMonth(iso: string) {
  const date = new Date(iso);
  const dd = date.getDate().toString();
  const mm = (date.getMonth() + 1).toString();
  return `${dd}/${mm}`;
}
