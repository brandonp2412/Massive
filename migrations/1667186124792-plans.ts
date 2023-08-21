import {MigrationInterface, QueryRunner} from 'typeorm'

export class plans1667186124792 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      days TEXT NOT NULL,
      workouts TEXT NOT NULL
    )
`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('plans')
  }
}
