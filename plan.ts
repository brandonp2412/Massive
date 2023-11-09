import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("plans")
export class Plan {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("text")
  title?: string;

  @Column("text")
  days: string;

  @Column("text")
  exercises: string;
}
