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

const select = `
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
}) => getDb().then(db => db.executeSql(select, [`%${search}%`, limit, offset]));
