import {Plan} from './plan';
import Set from './set';

export type DrawerParamList = {
  Home: {};
  Settings: {};
  Best: {};
  Plans: {};
  Workouts: {};
  'Edit set': {
    set: Set;
    workouts: string[];
    count: number;
  };
  'Edit plan': {
    plan: Plan;
  };
  'Edit workout': {
    value: Set;
  };
  'View best': {
    best: Set;
  };
};
