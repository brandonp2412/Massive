import {db} from './db';
import {Plan} from './plan';
import {DAYS} from './time';

export const getPlans = async (search: string): Promise<Plan[]> => {
  const select = `
    SELECT * from plans
    WHERE days LIKE ? OR workouts LIKE ?
  `;
  const [result] = await db.executeSql(select, [`%${search}%`, `%${search}%`]);
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

export const updatePlanWorkouts = async (oldName: string, newName: string) => {
  const update = `
    UPDATE plans SET workouts = REPLACE(workouts, ?, ?) 
      WHERE workouts LIKE ?
  `;
  return db.executeSql(update, [oldName, newName, `%${oldName}%`]);
};

export const updatePlan = async (value: Plan) => {
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

export const deletePlan = async (id: number) => {
  return db.executeSql(`DELETE FROM plans WHERE id = ?`, [id]);
};

export const getAllPlans = async (): Promise<Plan[]> => {
  const select = `SELECT * from plans`;
  const [result] = await db.executeSql(select);
  return result.rows.raw();
};
