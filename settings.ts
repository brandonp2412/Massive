import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export default class Settings {
  @PrimaryColumn("boolean")
  alarm = false;

  @Column("boolean")
  vibrate = true;

  @Column("text")
  sound: string | null;

  @Column("boolean")
  notify = false;

  @Column("boolean")
  images = true;

  @Column("boolean")
  showUnit = true;

  @Column("text")
  lightColor: string | null;

  @Column("text")
  darkColor: string | null;

  @Column("boolean")
  steps = true;

  @Column("text")
  date: string | null;

  @Column("boolean")
  showDate = false;

  @Column("text")
  theme: string | null;

  @Column("boolean")
  noSound = false;

  @Column("boolean")
  backup = false;

  @Column("text")
  backupDir: string | null;

  @Column("int")
  duration: number | null;

  @Column("text")
  startup: string | null;

  @Column("text")
  autoConvert: string | null;

  @Column("int")
  defaultSets: number | null;

  @Column("int")
  defaultMinutes: number | null;

  @Column("int")
  defaultSeconds: number | null;
}
