import { AppDataSource } from "./data-source";
import GymSet from "./gym-set";
import { Plan } from "./plan";
import Settings from "./settings";
import Weight from "./weight";

export const setRepo = AppDataSource.manager.getRepository(GymSet);
export const planRepo = AppDataSource.manager.getRepository(Plan);
export const settingsRepo = AppDataSource.manager.getRepository(Settings);
export const weightRepo = AppDataSource.manager.getRepository(Weight);

export const getNow = async (): Promise<string> => {
  const query = await AppDataSource.manager.query(
    "SELECT STRFTIME('%Y-%m-%dT%H:%M:%S','now','localtime') AS now"
  );
  return query[0].now;
};
