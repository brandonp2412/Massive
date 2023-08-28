import GymSet from "./gym-set";

export type HomePageParams = {
  Sets: {
    search?: string;

    /**
     * Reload the specified set by ID.
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
