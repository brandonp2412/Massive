import GymSet from "./gym-set";

export type DrawerParams = {
  Home: {
    search?: string;
  };
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
