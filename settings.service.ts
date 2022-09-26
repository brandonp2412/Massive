import {db} from './db';
import Settings from './settings';

export let settings: Settings;

export const getSettings = async () => {
  const [result] = await db.executeSql(`SELECT * FROM settings LIMIT 1`);
  settings = result.rows.item(0);
  return settings;
};

export const updateSettings = async (value: Settings) => {
  console.log(`${updateSettings.name}`, {value});
  const keys = Object.keys(value) as (keyof Settings)[];
  const sets = keys.map(key => `${key}=?`).join(',');
  const update = `UPDATE settings SET ${sets}`;
  const values = keys.map(key => value[key]);
  return db.executeSql(update, values);
};

export const getNext = async (): Promise<string | undefined> => {
  const [result] = await db.executeSql(
    `SELECT nextAlarm FROM settings LIMIT 1`,
  );
  return result.rows.item(0)?.nextAlarm;
};
