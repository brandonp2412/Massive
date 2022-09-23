export default interface Set {
  id?: number;
  name: string;
  reps: number;
  weight: number;
  sets?: number;
  minutes?: number;
  seconds?: number;
  created?: string;
  unit?: string;
  hidden?: boolean;
  image?: string;
  steps?: string;
}
