import {db, setRepo} from './db';
import GymSet from './gym-set';
import {Periods} from './periods';

export const getOneRepMax = async ({
  name,
  period,
}: {
  name: string;
  period: Periods;
}) => {
  // Brzycki formula https://en.wikipedia.org/wiki/One-repetition_maximum#Brzycki
  const select = `
    SELECT max(weight / (1.0278 - 0.0278 * reps)) AS weight, 
    STRFTIME('%Y-%m-%d', created) as created, unit
    FROM sets
    WHERE name = ? AND NOT hidden
    AND DATE(created) >= DATE('now', 'weekday 0', ?)
    GROUP BY name, STRFTIME(?, created)
  `;
  let difference = '-7 days';
  if (period === Periods.Monthly) difference = '-1 months';
  else if (period === Periods.Yearly) difference = '-1 years';
  let group = '%Y-%m-%d';
  if (period === Periods.Yearly) group = '%Y-%m';
  const [result] = await db.executeSql(select, [name, difference, group]);
  return result.rows.raw();
};

export const getBestSet = async (name: string): Promise<GymSet> => {
  return setRepo
    .createQueryBuilder()
    .select()
    .addSelect('MAX(weight)', 'weight')
    .where('name = :name', {name})
    .groupBy('name')
    .addGroupBy('reps')
    .orderBy('weight', 'DESC')
    .addOrderBy('reps', 'DESC')
    .getOne();
};
