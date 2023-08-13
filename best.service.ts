import { LIMIT } from "./constants";
import { setRepo } from "./db";
import GymSet from "./gym-set";

export const getBestSet = async (name: string): Promise<GymSet> => {
  return setRepo
    .createQueryBuilder()
    .select()
    .addSelect("MAX(weight)", "weight")
    .where("name = :name", { name })
    .groupBy("name")
    .addGroupBy("reps")
    .orderBy("weight", "DESC")
    .addOrderBy("reps", "DESC")
    .getOne();
};

export const getBestSets = ({
  term: term,
  offset,
}: {
  term: string;
  offset?: number;
}) => {
  return setRepo
    .createQueryBuilder("gym_set")
    .select(["gym_set.name", "gym_set.reps", "gym_set.weight"])
    .groupBy("gym_set.name")
    .innerJoin(
      (qb) =>
        qb
          .select(["gym_set2.name", "MAX(gym_set2.weight) AS max_weight"])
          .from(GymSet, "gym_set2")
          .where("gym_set2.name LIKE (:name)", { name: `%${term.trim()}%` })
          .groupBy("gym_set2.name"),
      "subquery",
      "gym_set.name = subquery.gym_set2_name AND gym_set.weight = subquery.max_weight"
    )
    .limit(LIMIT)
    .offset(offset || 0)
    .getMany();
};
