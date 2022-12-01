import {Item} from './Select'

export default interface Input<T> {
  name: string
  value?: T
  onChange: (value: T) => void
  items?: Item[]
}
