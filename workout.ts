import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm'

@Entity('workouts')
export class Workout {
  @PrimaryGeneratedColumn()
  id?: number

  @Column('text')
  name: string
}
