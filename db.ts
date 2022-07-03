import {enablePromise, openDatabase} from 'react-native-sqlite-storage';

enablePromise(true);
export const getDb = () => openDatabase({name: 'massive.db'});

const schema = `
  CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    reps INTEGER NOT NULL,
    weight INTEGER NOT NULL,
    created TEXT NOT NULL,
    unit TEXT DEFAULT 'kg'
  );
`;

export const setupSchema = () => getDb().then(db => db.executeSql(schema));
