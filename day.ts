import {Column, Entity, PrimaryColumn} from 'typeorm'

@Entity('days')
export class Day {
  @PrimaryColumn('int')
  id: number

  @Column('text')
  name: string
}
