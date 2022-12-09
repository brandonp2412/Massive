import {Column, Entity, PrimaryColumn} from 'typeorm'

@Entity('plans_workouts_workouts')
export class PlanWorkout {
  @PrimaryColumn('int')
  plansId: number

  @Column('int')
  workoutsId: number
}
