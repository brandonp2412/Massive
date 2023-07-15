import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('food')
export default class Food {
  @PrimaryGeneratedColumn()
  id?: number

  @Column('text')
  name: string

  @Column('number')
  amount: number

  @Column('number')
  unit: string

  @Column('text')
  created: string

  @Column('number')
  protein: number

  @Column('number')
  calories: number

  @Column('text')
  image?: string
}

export const defaultFood: Food = {
  created: '',
  name: '',
  unit: 'g',
  amount: 0,
  protein: 0,
  calories: 0,
}
