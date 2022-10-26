import {
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage';

enablePromise(true);

const migrations = [
  `
    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      reps INTEGER NOT NULL,
      weight INTEGER NOT NULL,
      created TEXT NOT NULL,
      unit TEXT DEFAULT 'kg'
    )
`,
  `
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      days TEXT NOT NULL,
      workouts TEXT NOT NULL
    )
`,
  `
    CREATE TABLE IF NOT EXISTS settings (
      minutes INTEGER NOT NULL DEFAULT 3,
      seconds INTEGER NOT NULL DEFAULT 30,
      alarm BOOLEAN NOT NULL DEFAULT 0,
      vibrate BOOLEAN NOT NULL DEFAULT 1,
      sets INTEGER NOT NULL DEFAULT 3
    )
`,
  `ALTER TABLE settings ADD COLUMN sound TEXT NULL`,
  `
    CREATE TABLE IF NOT EXISTS workouts(
      name TEXT PRIMARY KEY, 
      sets INTEGER DEFAULT 3
    )
  `,
  `
    ALTER TABLE sets ADD COLUMN hidden DEFAULT 0
  `,
  `
    ALTER TABLE settings ADD COLUMN notify DEFAULT 0
  `,
  `
    ALTER TABLE sets ADD COLUMN image TEXT NULL
  `,
  `
    ALTER TABLE settings ADD COLUMN images BOOLEAN DEFAULT 1
  `,
  `
    SELECT * FROM settings LIMIT 1
  `,
  `
    INSERT INTO settings(minutes) VALUES(3)
  `,
  `
    ALTER TABLE workouts ADD COLUMN steps TEXT NULL
  `,
  `
    INSERT OR IGNORE INTO workouts (name) SELECT DISTINCT name FROM sets
  `,
  `
    ALTER TABLE sets ADD COLUMN sets INTEGER NOT NULL DEFAULT 3
  `,
  `
    ALTER TABLE sets ADD COLUMN minutes INTEGER NOT NULL DEFAULT 3
  `,
  `
    ALTER TABLE sets ADD COLUMN seconds INTEGER NOT NULL DEFAULT 30
  `,
  `
    ALTER TABLE settings ADD COLUMN showUnit BOOLEAN DEFAULT 1
  `,
  `
    ALTER TABLE sets ADD COLUMN steps TEXT NULL
  `,
  `
    UPDATE sets SET steps = (
      SELECT workouts.steps FROM workouts WHERE workouts.name = sets.name
    )
  `,
  `
    DROP TABLE workouts
  `,
  `
    ALTER TABLE settings ADD COLUMN color TEXT NULL
  `,
  `
    UPDATE settings SET showUnit = 1
  `,
  `
    ALTER TABLE settings ADD COLUMN workouts BOOLEAN DEFAULT 1
  `,
  `
    ALTER TABLE settings ADD COLUMN steps BOOLEAN DEFAULT 1
  `,
  `
    ALTER TABLE settings ADD COLUMN nextAlarm TEXT NULL
  `,
  `
    ALTER TABLE settings ADD COLUMN newSet TEXT NULL
  `,
  `
    ALTER TABLE settings ADD COLUMN date TEXT NULL
  `,
  `
    ALTER TABLE settings ADD COLUMN showDate BOOLEAN DEFAULT 0
  `,
  `
    ALTER TABLE settings ADD COLUMN theme TEXT
  `,
  `
    ALTER TABLE settings ADD COLUMN showSets BOOLEAN DEFAULT 1
  `,
  `
    CREATE INDEX sets_created ON sets(created)
  `,
];

export let db: SQLiteDatabase;

export const runMigrations = async () => {
  db = await openDatabase({name: 'massive.db'});
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS migrations(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      command TEXT NOT NULL
    )
  `);
  const [result] = await db.executeSql(`SELECT * FROM migrations`);
  const missing = migrations.slice(result.rows.length);
  for (const command of missing) {
    await db.executeSql(command).catch(console.error);
    const insert = `
      INSERT INTO migrations    (command) 
      VALUES (?)
    `;
    await db.executeSql(insert, [command]);
  }
};
