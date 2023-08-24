import GymSet from "./gym-set";

export type HomePageParams = {
  Sets: {
    search?: string;
  };
  EditSet: {
    set: GymSet;
  };
  EditSets: {
    ids: number[];
  };
};
