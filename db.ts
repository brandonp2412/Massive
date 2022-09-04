import {
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage';

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
  return db;
};
