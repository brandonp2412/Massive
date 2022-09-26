import {db} from './db';
import Set from './set';
import {settings} from './settings.service';

export const updateSet = async (value: Set) => {
  const update = `
    UPDATE sets 
    SET name = ?, reps = ?, weight = ?, unit = ? 
    WHERE id = ?
  `;
  return db.executeSql(update, [
    value.name,
    value.reps,
    value.weight,
    value.unit,
    value.id,
  ]);
};

export const addSets = async (columns: string, values: string) => {
  console.log({columns, values});
  const insert = `
    INSERT INTO sets(${columns}) 
    VALUES ${values}
  `;
  return db.executeSql(insert);
};

export const addSet = async (value: Set) => {
  const keys = Object.keys(value) as (keyof Set)[];
  const questions = keys.map(() => '?').join(',');
  const insert = `
    INSERT INTO sets(${keys.join(',')},created) 
    VALUES (${questions},strftime('%Y-%m-%dT%H:%M:%S','now','localtime'))
  `;
  const values = keys.map(key => value[key]);
  return db.executeSql(insert, values);
};

export const deleteSets = async () => {
  return db.executeSql(`DELETE FROM sets`);
};

export const deleteSet = async (id: number) => {
  return db.executeSql(`DELETE FROM sets WHERE id = ?`, [id]);
};

export const deleteSetsBy = async (name: string) => {
  return db.executeSql(`DELETE FROM sets WHERE name = ?`, [name]);
};

export const getAllSets = async (): Promise<Set[]> => {
  const select = `SELECT * from sets`;
  const [result] = await db.executeSql(select);
  return result.rows.raw();
};

interface PageParams {
  search: string;
  limit: number;
  offset: number;
}

export const getSets = async ({
  search,
  limit,
  offset,
}: PageParams): Promise<Set[]> => {
  const format = settings.date || '%Y-%m-%d %H:%M';
  const select = `
    SELECT id, name, reps, weight, sets, minutes, seconds, 
      STRFTIME(?, created) as created, unit, image, steps 
    FROM sets 
    WHERE name LIKE ? AND NOT hidden
    ORDER BY created DESC 
    LIMIT ? OFFSET ?
  `;
  const [result] = await db.executeSql(select, [
    format,
    `%${search}%`,
    limit,
    offset,
  ]);
  return result.rows.raw();
};

export const defaultSet: Set = {
  name: '',
  reps: 10,
  weight: 20,
  unit: 'kg',
};

export const updateManySet = async ({
  oldName,
  newName,
  minutes,
  seconds,
  sets,
  steps,
}: {
  oldName: string;
  newName: string;
  minutes: string;
  seconds: string;
  sets: string;
  steps?: string;
}) => {
  const update = `
    UPDATE sets SET name = ?, minutes = ?, seconds = ?, sets = ?, steps = ?
    WHERE name = ?
  `;
  return db.executeSql(update, [
    newName,
    minutes,
    seconds,
    sets,
    steps,
    oldName,
  ]);
};

export const updateSetImage = async (name: string, image: string) => {
  const update = `UPDATE sets SET image = ? WHERE name = ?`;
  return db.executeSql(update, [image, name]);
};

export const getNames = async (): Promise<string[]> => {
  const [result] = await db.executeSql('SELECT DISTINCT name FROM sets');
  const values: {name: string}[] = result.rows.raw();
  return values.map(value => value.name);
};

export const getToday = async (): Promise<Set | undefined> => {
  const select = `
    SELECT * FROM sets
    WHERE NOT hidden
      AND created LIKE strftime('%Y-%m-%d%%', 'now', 'localtime')
    ORDER BY created DESC
    LIMIT 1
  `;
  const [result] = await db.executeSql(select);
  return result.rows.item(0);
};

export const countToday = async (name: string): Promise<number> => {
  const select = `
    SELECT COUNT(*) as total FROM sets
    WHERE created LIKE strftime('%Y-%m-%d%%', 'now', 'localtime')
      AND name = ?
  `;
  const [result] = await db.executeSql(select, [name]);
  return Number(result.rows.item(0)?.total);
};

export const getDistinctSets = async ({
  search,
  limit,
  offset,
}: PageParams): Promise<Set[]> => {
  const select = `
    SELECT name, image, sets, minutes, seconds, steps
    FROM sets
    WHERE sets.name LIKE ? 
    GROUP BY sets.name
    ORDER BY sets.name
    LIMIT ? OFFSET ?
  `;
  const [result] = await db.executeSql(select, [search, limit, offset]);
  return result.rows.raw();
};
