import {enablePromise, openDatabase} from 'react-native-sqlite-storage';

enablePromise(true);
export const getDb = () => openDatabase({name: 'massive.db'});

export const createSets = `
  CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    reps INTEGER NOT NULL,
    weight INTEGER NOT NULL,
    created TEXT NOT NULL,
    unit TEXT DEFAULT 'kg'
  );
`;

export const createPlans = `
  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    days TEXT NOT NULL,
    workouts TEXT NOT NULL
  );
`;

const selectProgress = `
  SELECT count(*) as count from sets
  WHERE created LIKE ? 
    AND name = ?
`;
export const getProgress = ({created, name}: {created: string; name: string}) =>
  getDb().then(db => db.executeSql(selectProgress, [`%${created}%`, name]));
