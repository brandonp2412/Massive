import CountMany from './count-many';
import {db} from './db';

export const countMany = async (names: string[]): Promise<CountMany[]> => {
  const questions = names.map(_ => '(?)').join(',');
  console.log({questions, names});
  const select = `
    SELECT workouts.name, COUNT(sets.id) as total
    FROM (select 0 as name union values ${questions}) as workouts 
    LEFT JOIN sets ON sets.name = workouts.name 
      AND sets.created LIKE STRFTIME('%Y-%m-%d%%', 'now', 'localtime')
      AND NOT sets.hidden
    GROUP BY workouts.name
    LIMIT -1
    OFFSET 1
  `;
  const [result] = await db.executeSql(select, names);
  return result.rows.raw();
};
