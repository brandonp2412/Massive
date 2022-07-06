import {enablePromise, openDatabase} from 'react-native-sqlite-storage';

enablePromise(true);
export const getDb = () => openDatabase({name: 'massive.db'});

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

export const setupSchema = () =>
  getDb().then(db => {
    db.executeSql(createSets);
    db.executeSql(createPlans);
  });

const selectPlans = `
  SELECT * from plans
  WHERE days LIKE ? OR workouts LIKE ?
`;
export const getPlans = ({search}: {search: string}) =>
  getDb().then(db =>
    db.executeSql(selectPlans, [`%${search}%`, `%${search}%`]),
  );

const selectSets = `
  SELECT * from sets 
  WHERE name LIKE ? 
  ORDER BY created DESC 
  LIMIT ? OFFSET ?
`;

export const getSets = ({
  search,
  limit,
  offset,
}: {
  search: string;
  limit: number;
  offset: number;
}) =>
  getDb().then(db => db.executeSql(selectSets, [`%${search}%`, limit, offset]));
