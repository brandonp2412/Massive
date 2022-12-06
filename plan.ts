import {Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from 'typeorm'
import {Day} from './day'
import {Workout} from './workout'

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn()
  id?: number

  @ManyToMany(() => Day)
  @JoinTable()
  days: Day[]

  @ManyToMany(() => Workout)
  @JoinTable()
  workouts: Workout[]
}
