import {db} from './db';
import Settings from './settings';

export const getSettings = async () => {
  const [result] = await db.executeSql(`SELECT * FROM settings LIMIT 1`);
  const settings: Settings = result.rows.item(0);
  return settings;
};

export const setSettings = async (value: Settings) => {
  const update = `
    UPDATE settings 
    SET vibrate=?,minutes=?,sets=?,seconds=?,alarm=?,
      predict=?,sound=?,notify=?,images=?
  `;
  return db.executeSql(update, [
    value.vibrate,
    value.minutes,
    value.sets,
    value.seconds,
    value.alarm,
    value.predict,
    value.sound,
    value.notify,
    value.images,
  ]);
};
