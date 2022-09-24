import Set from './set';

export type HomePageParams = {
  Sets: {};
  EditSet: {
    set: Set;
    workouts: string[];
  };
};
