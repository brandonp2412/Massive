import {db} from './db';
import Workout from './workout';

export const getWorkout = async (name: string): Promise<Workout> => {
  const select = `
    SELECT * FROM workouts
    WHERE workouts.name = ? 
    LIMIT 1
  `;
  const [result] = await db.executeSql(select, [name]);
  return result.rows.raw()[0];
};

export const updateSteps = (name: string, steps: string): Promise<unknown> => {
  const select = `
    UPDATE workouts SET steps = ? WHERE name = ?
  `;
  return db.executeSql(select, [steps, name]);
};

export const addWorkout = (value: Workout) => {
  const insert = `
    INSERT INTO workouts(name, steps)
    VALUES (?, ?)
  `;
  return db.executeSql(insert, [value.name, value.steps]);
};

export const removeWorkout = (name: string) => {
  const remove = `
    DELETE FROM workouts
    WHERE name = ?
  `;
  return db.executeSql(remove, [name]);
};
