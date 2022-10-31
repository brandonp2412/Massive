import {setRepo} from './db';
import GymSet from './gym-set';

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
