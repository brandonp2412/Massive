import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("sets")
export default class GymSet {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("text")
  name: string;

  @Column("int")
  reps: number;

  @Column("int")
  weight: number;

  @Column("int")
  sets = 3;

  @Column("int")
  minutes = 3;

  @Column("int")
  seconds = 30;

  @Column("boolean")
  hidden = false;

  @Column("text")
  created: string;

  @Column("text")
  unit: string;

  @Column("text")
  image: string;

  @Column("text")
  steps?: string;
}

export const defaultSet: GymSet = {
  created: "",
  name: "",
  image: "",
  hidden: false,
  minutes: 3,
  seconds: 30,
  reps: 0,
  sets: 0,
  unit: "kg",
  weight: 0,
};
