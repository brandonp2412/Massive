import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn()
  id?: number

  @Column('text')
  days: string

  @Column('text')
  workouts: string
}
