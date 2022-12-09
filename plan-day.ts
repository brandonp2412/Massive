import {Column, Entity, PrimaryColumn} from 'typeorm'

@Entity('plans_days_days')
export class PlanDay {
  @PrimaryColumn('int')
  plansId: number

  @Column('int')
  daysId: number
}
