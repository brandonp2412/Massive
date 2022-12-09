import {MigrationInterface, QueryRunner, Table, TableColumn} from 'typeorm'
import {AppDataSource} from '../data-source'
import {Day} from '../day'
import {planRepo} from '../db'
import {PlanWorkout} from '../plan-workout'
import {DAYS} from '../time'

export class addDays1670284587217 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'days',
        columns: [
          new TableColumn({name: 'id', type: 'int', isPrimary: true}),
          new TableColumn({name: 'name', type: 'text', isNullable: false}),
        ],
      }),
    )
    await queryRunner.query(`
      INSERT INTO days VALUES 
        (1, 'Sunday'),
        (2, 'Monday'),
        (3, 'Tuesday'),
        (4, 'Wednesday'),
        (5, 'Thursday'),
        (6, 'Friday'),
        (7, 'Saturday')`)
    await queryRunner.createTable(
      new Table({
        name: 'plans_days_days',
        columns: [
          new TableColumn({name: 'plansId', type: 'int'}),
          new TableColumn({name: 'daysId', type: 'int'}),
        ],
      }),
    )
    const plans = await AppDataSource.query('SELECT * FROM plans')
    const planWorkoutRepo = AppDataSource.getRepository(PlanWorkout)
    for (const plan of plans) {
      const days: Day[] = plan.days.split(',').map((day: string) => {
        const id = DAYS.indexOf(day) + 1
        return {id, name: day}
      })
      planWorkoutRepo.save(days)
      await planRepo.update(plan.id, {days})
    }
    await queryRunner.dropColumn('plans', 'days')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
