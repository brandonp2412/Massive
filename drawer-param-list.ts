import GymSet from "./gym-set";

export type DrawerParams = {
  Home: {};
  Settings: {};
  Graphs: {};
  Plans: {};
  Exercises: {
    clearNames?: boolean;
    search?: string;
    update?: GymSet;
    reset?: number;
  };
  Timer: {};
  Weight: {};
  Insights: {};
};
