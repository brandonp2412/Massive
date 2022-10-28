export default interface Settings {
  alarm: number;
  vibrate: number;
  sound: string;
  notify: number;
  images: number;
  showUnit: number;
  color: string;
  steps: number;
  date: string;
  showDate: number;
  theme: 'system' | 'dark' | 'light';
  showSets: number;
  noSound: number;
}
