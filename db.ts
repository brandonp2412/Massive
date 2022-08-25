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

export const createSettings = `
  CREATE TABLE IF NOT EXISTS settings (
    minutes INTEGER NOT NULL DEFAULT 3,
    seconds INTEGER NOT NULL DEFAULT 30,
    alarm BOOLEAN NOT NULL DEFAULT false,
    vibrate BOOLEAN NOT NULL DEFAULT true,
    predict BOOLEAN NOT NULL DEFAULT true,
    sets INTEGER NOT NULL DEFAULT 3
  );
`;

export const addSound = `
  ALTER TABLE settings ADD COLUMN sound TEXT NULL;
`;
