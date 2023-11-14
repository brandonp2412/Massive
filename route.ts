import { DrawerParams } from "./drawer-params";

export default interface Route {
  name: keyof DrawerParams;
  component: React.ComponentType<any>;
  icon: string;
}
