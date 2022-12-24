import {Item} from './Select'

export default interface Input<T> {
  key: keyof T
  name: string
  items?: Item[]
}
