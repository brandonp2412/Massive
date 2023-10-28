import GymSet from "./gym-set";

export type DrawerParams = {
  Home: {};
  Settings: {};
  Graphs: {};
  Plans: {};
  Workouts: {
    clearNames?: boolean;
    search?: string;
    update?: GymSet;
    reset?: number;
  };
  Timer: {};
  Weight: {};
  Insights: {};
};
