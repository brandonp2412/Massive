import {DrawerParamList} from './App';

export default interface Route {
  name: keyof DrawerParamList;
  component: React.ComponentType<any>;
  icon: string;
}
