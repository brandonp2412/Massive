import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("plans")
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  days: string;

  @Column("text")
  exercises: string;

  @Column("text")
  title: string | null;
}

export const defaultPlan: Partial<Plan> = {
  days: "",
  exercises: "",
  title: "",
};
