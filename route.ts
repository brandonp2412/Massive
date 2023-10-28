import { DrawerParams } from "./drawer-param-list";

export default interface Route {
  name: keyof DrawerParams;
  component: React.ComponentType<any>;
  icon: string;
}
