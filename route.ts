import {DrawerParamList} from './drawer-param-list'

export default interface Route {
  name: keyof DrawerParamList
  component: React.ComponentType<any>
  icon: string
}
