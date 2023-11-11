import { Column, Entity, PrimaryColumn } from "typeorm";
import { emitter } from "./emitter";

@Entity()
export default class Settings {
  @PrimaryColumn("boolean")
  alarm: boolean;

  @Column("boolean")
  vibrate: boolean;

  @Column("text")
  sound: string;

  @Column("boolean")
  notify: boolean;

  @Column("boolean")
  images: boolean;

  @Column("boolean")
  showUnit: boolean;

  @Column("text")
  lightColor?: string;

  @Column("text")
  darkColor?: string;

  @Column("boolean")
  steps: boolean;

  @Column("text")
  date: string;

  @Column("boolean")
  showDate: boolean;

  @Column("text")
  theme: string;

  @Column("boolean")
  showSets: boolean;

  @Column("boolean")
  noSound: boolean;

  @Column("boolean")
  backup: boolean;

  @Column("int")
  duration: number;
}

export const SETTINGS = "settings";

export const settingsUpdated = () => {
  emitter.emit(SETTINGS);
};
