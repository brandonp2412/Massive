import {Plan} from './plan';
import GymSet from './gym-set';

export type PlanPageParams = {
  PlanList: {};
  EditPlan: {
    plan: Plan;
  };
  StartPlan: {
    plan: Plan;
    set: GymSet;
  };
};
