import {MigrationInterface, QueryRunner, Table, TableColumn} from 'typeorm'
import {AppDataSource} from '../data-source'
import {planRepo} from '../db'
import {PlanWorkout} from '../plan-workout'
import {Workout} from '../workout'

export class addWorkouts1670477728181 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'workouts',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
          }),
          new TableColumn({name: 'name', type: 'text', isNullable: false}),
        ],
      }),
    )
    await queryRunner.createTable(
      new Table({
        name: 'plans_workouts_workouts',
        columns: [
          new TableColumn({name: 'plansId', type: 'int'}),
          new TableColumn({name: 'workoutsId', type: 'int'}),
        ],
      }),
    )
    const plans = await AppDataSource.query('SELECT * FROM plans')
    const repo = AppDataSource.getRepository(PlanWorkout)
    for (const plan of plans) {
      const workouts: PlanWorkout[] = plan.workouts
        .split(',')
        .map((workout: string) => ({plansId: plan.id}))
      repo.save()
    }
    await queryRunner.dropColumn('plans', 'workouts')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
