import GymSet from './gym-set'
import {Plan} from './plan'

export type PlanPageParams = {
  PlanList: {}
  EditPlan: {
    plan: Plan
  }
  StartPlan: {
    plan: Plan
  }
  EditSet: {
    set: GymSet
  }
}
