import {db} from './db';
import Set from './set';
import Workout from './workout';

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

export const addSets = async (values: string) => {
  const insert = `
    INSERT INTO sets(name,reps,weight,created,unit,hidden) 
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

export interface PageParams {
  search: string;
  limit: number;
  offset: number;
}

export const getSets = async ({
  search,
  limit,
  offset,
}: PageParams): Promise<Set[]> => {
  const select = `
    SELECT * from sets 
    WHERE name LIKE ? AND NOT hidden
    ORDER BY created DESC 
    LIMIT ? OFFSET ?
  `;
  const [result] = await db.executeSql(select, [`%${search}%`, limit, offset]);
  return result.rows.raw();
};

export const getTodaysSets = async (): Promise<Set[]> => {
  const today = new Date().toISOString().split('T')[0];
  const [result] = await db.executeSql(
    `SELECT * FROM sets WHERE created LIKE ? ORDER BY created DESC`,
    [`${today}%`],
  );
  return result.rows.raw();
};

export const defaultSet = {
  name: '',
  id: 0,
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
}: {
  oldName: string;
  newName: string;
  minutes: string;
  seconds: string;
  sets: string;
}) => {
  const update = `
    UPDATE sets SET name = ?, minutes = ?, seconds = ?, sets = ? 
    WHERE name = ?
  `;
  return db.executeSql(update, [newName, minutes, seconds, sets, oldName]);
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

export const getDistinctSets = async ({
  search,
  limit,
  offset,
}: PageParams): Promise<Workout[]> => {
  const select = `
    SELECT DISTINCT name, image, sets, minutes, seconds
    FROM sets
    WHERE sets.name LIKE ? 
    GROUP BY sets.name
    ORDER BY sets.name
    LIMIT ? OFFSET ?
  `;
  const [result] = await db.executeSql(select, [search, limit, offset]);
  return result.rows.raw();
};
