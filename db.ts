import {
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage';
import {addPlanDays, addPlanSets, getPlans} from './plan.service';
import {DAYS} from './time';

enablePromise(true);

const migrations: (string | Function)[] = [
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
    ALTER TABLE sets ADD COLUMN hidden DEFAULT false
  `,
  `
    ALTER TABLE settings ADD COLUMN notify DEFAULT false
  `,
  `
    ALTER TABLE sets ADD COLUMN image TEXT NULL
  `,
  `
    ALTER TABLE settings ADD COLUMN images BOOLEAN DEFAULT true
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
    ALTER TABLE settings ADD COLUMN showUnit BOOLEAN DEFAULT true
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
    ALTER TABLE settings ADD COLUMN workouts BOOLEAN DEFAULT true
  `,
  `
    ALTER TABLE settings ADD COLUMN steps BOOLEAN DEFAULT true
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
    ALTER TABLE settings ADD COLUMN showDate BOOLEAN DEFAULT false
  `,
  `
    ALTER TABLE settings ADD COLUMN theme TEXT
  `,
  `
    ALTER TABLE settings ADD COLUMN showSets BOOLEAN DEFAULT true
  `,
  `
    CREATE INDEX sets_created ON sets(created)
  `,
  `
    ALTER TABLE settings ADD COLUMN noSound BOOLEAN DEFAULT false
  `,
  `
    CREATE TABLE days(
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    )
  `,
  `
    INSERT INTO days(name, id) VALUES
      ('Sunday', 0),
      ('Monday', 1),
      ('Tuesday', 2),
      ('Wednesday', 3),
      ('Thursday', 4),
      ('Friday', 5),
      ('Saturday', 6)
  `,
  `
    CREATE TABLE plansDays(
      planId INTEGER,
      dayId INTEGER,
      FOREIGN KEY(planId) REFERENCES plans(id)
      FOREIGN KEY(dayId) REFERENCES days(id)
    )
  `,
  `
    CREATE TABLE plansSets(
      setName TEXT,
      planId INTEGER,
      FOREIGN KEY(planId) REFERENCES plans(id)
      FOREIGN KEY(setName) REFERENCES sets(name)
    )
  `,
  async () => {
    const plans = await getPlans('');
    for (const plan of plans) {
      const dayIds = plan.days.split(',').map(day => DAYS.indexOf(day));
      await addPlanDays(plan.id, dayIds);
      const setNames = plan.workouts.split(',');
      await addPlanSets(plan.id, setNames);
    }
  },
];

export let db: SQLiteDatabase;

export const runMigrations = async () => {
  db = await openDatabase({name: 'massive.db'});
  await db.executeSql('DROP TABLE migrations');
  await db.executeSql('DROP TABLE plansSets');
  await db.executeSql('DROP TABLE plansDays');
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS migrations(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      command TEXT NOT NULL
    )
  `);
  const [result] = await db.executeSql(`SELECT * FROM migrations`);
  const missing = migrations.slice(result.rows.length);
  for (const command of missing) {
    if (typeof command === 'string')
      await db.executeSql(command).catch(console.error);
    else await command(db);
    const insert = `
      INSERT INTO migrations    (command) 
      VALUES (?)
    `;
    await db.executeSql(insert, [command.toString()]);
  }
};
