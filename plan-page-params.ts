import {Plan} from './plan';
import Set from './set';

export type PlanPageParams = {
  PlanList: {};
  EditPlan: {
    plan: Plan;
  };
  StartPlan: {
    plan: Plan;
    set: Set;
  };
};
