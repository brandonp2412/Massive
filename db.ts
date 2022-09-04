import {
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage';
import {Periods} from './periods';
import {Plan} from './plan';
import Set from './set';
import Settings from './settings';
import {DAYS} from './time';
import Volume from './volume';
import Workout from './workout';

enablePromise(true);

const createSets = `
  CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    reps INTEGER NOT NULL,
    weight INTEGER NOT NULL,
    created TEXT NOT NULL,
    unit TEXT DEFAULT 'kg'
  );
`;

const createPlans = `
  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    days TEXT NOT NULL,
    workouts TEXT NOT NULL
  );
`;

const createSettings = `
  CREATE TABLE IF NOT EXISTS settings (
    minutes INTEGER NOT NULL DEFAULT 3,
    seconds INTEGER NOT NULL DEFAULT 30,
    alarm BOOLEAN NOT NULL DEFAULT false,
    vibrate BOOLEAN NOT NULL DEFAULT true,
    predict BOOLEAN NOT NULL DEFAULT true,
    sets INTEGER NOT NULL DEFAULT 3
  );
`;

const addSound = `
  ALTER TABLE settings ADD COLUMN sound TEXT NULL;
`;

const createWorkouts = `
  CREATE TABLE IF NOT EXISTS workouts(
    name TEXT PRIMARY KEY, 
    sets INTEGER DEFAULT 3
  );
`;

const addHidden = `
  ALTER TABLE sets ADD COLUMN hidden DEFAULT false;
`;

const addNotify = `
  ALTER TABLE settings ADD COLUMN notify DEFAULT false;
`;

const addImage = `
  ALTER TABLE sets ADD COLUMN image TEXT NULL;
`;

const addImages = `
  ALTER TABLE settings ADD COLUMN images BOOLEAN DEFAULT false;
`;

const selectSettings = `
  SELECT * FROM settings LIMIT 1
`;

const insertSettings = `
  INSERT INTO settings(minutes) VALUES(3);
`;

export let db: SQLiteDatabase;

export const migrations = async () => {
  db = await openDatabase({name: 'massive.db'});
  await db.executeSql(createPlans);
  await db.executeSql(createSets);
  await db.executeSql(createSettings);
  await db.executeSql(createWorkouts);
  await db.executeSql(addSound).catch(() => null);
  await db.executeSql(addHidden).catch(() => null);
  await db.executeSql(addNotify).catch(() => null);
  await db.executeSql(addImage).catch(() => null);
  await db.executeSql(addImages).catch(() => null);
  const [result] = await db.executeSql(selectSettings);
  if (result.rows.length === 0) await db.executeSql(insertSettings);
};

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

export const setSet = async (value: Set) => {
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

export const setWorkouts = async (oldName: string, newName: string) => {
  const update = `
    UPDATE plans SET workouts = REPLACE(workouts, ?, ?) 
      WHERE workouts LIKE ?
  `;
  return db.executeSql(update, [oldName, newName, `%${oldName}%`]);
};

export const setPlan = async (value: Plan) => {
  const update = `UPDATE plans SET days = ?, workouts = ? WHERE id = ?`;
  return db.executeSql(update, [value.days, value.workouts, value.id]);
};

export const addPlan = async (value: Plan) => {
  const insert = `INSERT INTO plans(days, workouts) VALUES (?, ?)`;
  return db.executeSql(insert, [value.days, value.workouts]);
};

export const addPlans = async (values: string) => {
  const insert = `
    INSERT INTO plans(days,workouts) VALUES ${values}
  `;
  return db.executeSql(insert);
};

export const deletePlans = async () => {
  return db.executeSql(`DELETE FROM plans`);
};

export const deleteSets = async () => {
  return db.executeSql(`DELETE FROM sets`);
};

export const deletePlan = async (id: number) => {
  return db.executeSql(`DELETE FROM plans WHERE id = ?`, [id]);
};

export const deleteSet = async (id: number) => {
  return db.executeSql(`DELETE FROM sets WHERE id = ?`, [id]);
};

export const deleteSetsBy = async (name: string) => {
  return db.executeSql(`DELETE FROM sets WHERE name = ?`, [name]);
};

export const getAllPlans = async (): Promise<Plan[]> => {
  const select = `SELECT * from plans`;
  const [result] = await db.executeSql(select);
  return result.rows.raw();
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

export const getTodaysPlan = async (): Promise<Plan[]> => {
  const today = DAYS[new Date().getDay()];
  const [result] = await db.executeSql(
    `SELECT * FROM plans WHERE days LIKE ? LIMIT 1`,
    [`%${today}%`],
  );
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

export const getBest = async (query: string): Promise<Set> => {
  const bestWeight = `
    SELECT name, reps, unit, MAX(weight) AS weight 
    FROM sets
    WHERE name = ? AND NOT hidden
    GROUP BY name;
  `;
  const bestReps = `
    SELECT name, MAX(reps) as reps, unit, weight 
    FROM sets
    WHERE name = ? AND weight = ? AND NOT hidden
    GROUP BY name;
  `;
  const [weightResult] = await db.executeSql(bestWeight, [query]);
  if (!weightResult.rows.length) return {...defaultSet};
  const [repsResult] = await db.executeSql(bestReps, [
    query,
    weightResult.rows.item(0).weight,
  ]);
  return repsResult.rows.item(0);
};

export const setSetName = async (oldName: string, newName: string) => {
  const update = `UPDATE sets SET name = ? WHERE name = ?`;
  return db.executeSql(update, [newName, oldName]);
};

export const setSetImage = async (name: string, image: string) => {
  const update = `UPDATE sets SET image = ? WHERE name = ?`;
  return db.executeSql(update, [name, image]);
};

export const getWeights = async (
  name: string,
  period: Periods,
): Promise<Set[]> => {
  const select = `
    SELECT max(weight) AS weight, 
    STRFTIME('%Y-%m-%d', created) as created, unit
    FROM sets
    WHERE name = ? AND NOT hidden
    AND DATE(created) >= DATE('now', 'weekday 0', ?)
    GROUP BY name, STRFTIME('%Y-%m-%d', created)
  `;
  let difference = '-7 days';
  if (period === Periods.Monthly) difference = '-1 months';
  else if (period === Periods.Yearly) difference = '-1 years';
  const [result] = await db.executeSql(select, [name, difference]);
  return result.rows.raw();
};

export const getVolumes = async (
  name: string,
  period: Periods,
): Promise<Volume[]> => {
  const select = `
    SELECT sum(weight * reps) AS value, 
    STRFTIME('%Y-%m-%d', created) as created, unit
    FROM sets
    WHERE name = ? AND NOT hidden
    AND DATE(created) >= DATE('now', 'weekday 0', ?)
    GROUP BY name, STRFTIME('%Y-%m-%d', created)
  `;
  let difference = '-7 days';
  if (period === Periods.Monthly) difference = '-1 months';
  else if (period === Periods.Yearly) difference = '-1 years';
  const [result] = await db.executeSql(select, [name, difference]);
  return result.rows.raw();
};

export const getNames = async (): Promise<string[]> => {
  const [result] = await db.executeSql('SELECT DISTINCT name FROM sets');
  return result.rows.raw();
};

export const getBestWeights = async (search: string): Promise<Set[]> => {
  const select = `
    SELECT name, reps, unit, MAX(weight) AS weight 
    FROM sets
    WHERE name LIKE ? AND NOT hidden
    GROUP BY name;
  `;
  const [result] = await db.executeSql(select, [`%${search}%`]);
  return result.rows.raw();
};

export const getBestReps = async (
  name: string,
  weight: number,
): Promise<Set[]> => {
  const select = `
    SELECT name, MAX(reps) as reps, unit, weight 
    FROM sets
    WHERE name = ? AND weight = ? AND NOT hidden
    GROUP BY name;
  `;
  const [result] = await db.executeSql(select, [name, weight]);
  return result.rows.raw();
};

export const getPlans = async (search: string): Promise<Plan[]> => {
  const select = `
    SELECT * from plans
    WHERE days LIKE ? OR workouts LIKE ?
  `;
  const [result] = await db.executeSql(select, [`%${search}%`, `%${search}%`]);
  return result.rows.raw();
};

export const getWorkouts = async ({
  search,
  limit,
  offset,
}: PageParams): Promise<Workout[]> => {
  const select = `
    SELECT DISTINCT sets.name
    FROM sets
    WHERE sets.name LIKE ? 
    ORDER BY sets.name
    LIMIT ? OFFSET ?
  `;
  const [result] = await db.executeSql(select, [search, limit, offset]);
  return result.rows.raw();
};
