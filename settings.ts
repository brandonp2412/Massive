export default interface Settings {
  alarm: number;
  vibrate: number;
  newSet?: 'predict' | 'empty';
  sound?: string;
  notify?: number;
  images?: number;
  showUnit?: number;
  color?: string;
  workouts: number;
  nextAlarm?: string;
  steps?: number;
  date?: string;
  showDate: number;
}
