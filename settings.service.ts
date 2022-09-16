import {db} from './db';
import Settings from './settings';

export const getSettings = async () => {
  const [result] = await db.executeSql(`SELECT * FROM settings LIMIT 1`);
  const settings: Settings = result.rows.item(0);
  return settings;
};

export const updateSettings = async (value: Settings) => {
  const keys = Object.keys(value) as (keyof Settings)[];
  const sets = keys.map(key => `${key}=?`).join(',');
  const update = `UPDATE settings SET ${sets}`;
  const values = keys.map(key => value[key]);
  return db.executeSql(update, values);
};
