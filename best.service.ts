import {db} from './db';
import {Periods} from './periods';
import Set from './set';
import {defaultSet} from './set.service';
import Volume from './volume';

export const getBestSet = async (name: string): Promise<Set> => {
  const bestWeight = `
    SELECT name, reps, unit, MAX(weight) AS weight 
    FROM sets
    WHERE name = ?
    GROUP BY name;
  `;
  const bestReps = `
    SELECT name, MAX(reps) as reps, unit, weight, sets, minutes, seconds, image
    FROM sets
    WHERE name = ? AND weight = ?
    GROUP BY name;
  `;
  const [weightResult] = await db.executeSql(bestWeight, [name]);
  if (!weightResult.rows.length) return {...defaultSet};
  const [repsResult] = await db.executeSql(bestReps, [
    name,
    weightResult.rows.item(0).weight,
  ]);
  return repsResult.rows.item(0);
};

export const getWeightsBy = async (
  name: string,
  period: Periods,
): Promise<Set[]> => {
  const select = `
    SELECT max(weight) AS weight, 
    STRFTIME('%Y-%m-%d', created) as created, unit
    FROM sets
    WHERE name = ? AND NOT hidden
    AND DATE(created) >= DATE('now', 'weekday 0', ?)
    GROUP BY name, STRFTIME('%Y-%m-%d', created)
  `;
  let difference = '-7 days';
  if (period === Periods.Monthly) difference = '-1 months';
  else if (period === Periods.Yearly) difference = '-1 years';
  const [result] = await db.executeSql(select, [name, difference]);
  return result.rows.raw();
};

export const getVolumes = async (
  name: string,
  period: Periods,
): Promise<Volume[]> => {
  const select = `
    SELECT sum(weight * reps) AS value, 
    STRFTIME('%Y-%m-%d', created) as created, unit
    FROM sets
    WHERE name = ? AND NOT hidden
    AND DATE(created) >= DATE('now', 'weekday 0', ?)
    GROUP BY name, STRFTIME('%Y-%m-%d', created)
  `;
  let difference = '-7 days';
  if (period === Periods.Monthly) difference = '-1 months';
  else if (period === Periods.Yearly) difference = '-1 years';
  const [result] = await db.executeSql(select, [name, difference]);
  return result.rows.raw();
};

export const getBestWeights = async (search: string): Promise<Set[]> => {
  const select = `
    SELECT name, reps, unit, MAX(weight) AS weight 
    FROM sets
    WHERE name LIKE ? AND NOT hidden
    GROUP BY name;
  `;
  const [result] = await db.executeSql(select, [`%${search}%`]);
  return result.rows.raw();
};

export const getBestReps = async (
  name: string,
  weight: number,
): Promise<Set[]> => {
  const select = `
    SELECT name, MAX(reps) as reps, unit, weight, image
    FROM sets
    WHERE name = ? AND weight = ? AND NOT hidden
    GROUP BY name;
  `;
  const [result] = await db.executeSql(select, [name, weight]);
  return result.rows.raw();
};
