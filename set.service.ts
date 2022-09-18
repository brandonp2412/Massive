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
  const insert = `
    INSERT INTO sets(name, reps, weight, created, unit, image) 
    VALUES (?,?,?,strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime'),?, ?)
  `;
  const {name, reps, weight, unit, image} = value;
  return db.executeSql(insert, [name, reps, weight, unit, image]);
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

export const updateSetName = async (oldName: string, newName: string) => {
  const update = `UPDATE sets SET name = ? WHERE name = ?`;
  return db.executeSql(update, [newName, oldName]);
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
    SELECT DISTINCT sets.name, sets.image
    FROM sets
    WHERE sets.name LIKE ? 
    ORDER BY sets.name
    LIMIT ? OFFSET ?
  `;
  const [result] = await db.executeSql(select, [search, limit, offset]);
  return result.rows.raw();
};
