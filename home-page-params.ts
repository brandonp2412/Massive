import GymSet from "./gym-set";

export type HomePageParams = {
  Sets: {
    search?: string;

    /**
     * Reload the current list with limit = offset
     */
    refresh?: number;

    /**
     * Reload the list with limit = 0
     */
    reset?: number;
  };
  EditSet: {
    set: GymSet;
  };
  EditSets: {
    ids: number[];
  };
};
