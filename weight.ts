import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("weights")
export default class Weight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int")
  value: number;

  @Column("text")
  created: string;

  @Column("text")
  unit = "kg";
}

export const defaultWeight: Partial<Weight> = {
  created: "",
  unit: "kg",
  value: 0,
};
