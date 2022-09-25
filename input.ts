export default interface Input<T> {
  name: string;
  value?: T;
  onChange: (value: T) => void;
}
