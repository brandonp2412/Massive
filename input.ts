import Settings from './settings'
import {Item} from './Select'

export default interface Input<T> {
  name: string
  key: keyof Settings
  value?: T
  items?: Item[]
}
