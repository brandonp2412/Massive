import GymSet from "./gym-set";

export type HomePageParams = {
  Sets: {
    search?: string;

    /**
     * Update the specified set
     */
    refresh?: GymSet;

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
