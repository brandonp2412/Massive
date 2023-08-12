import { Item } from "./Select";
import Settings from "./settings";

export default interface Input<T> {
  name: string;
  key: keyof Settings;
  value?: T;
  items?: Item[];
}
