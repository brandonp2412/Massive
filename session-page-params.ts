import {Plan} from './plan';
import Set from './set';

export type SessionPageParams = {
  SessionList: {};
  StartSession: {
    plan: Plan;
    set: Set;
  };
};
