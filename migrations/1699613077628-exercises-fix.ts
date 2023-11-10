import { MigrationInterface, QueryRunner } from "typeorm";

export class exercisesFix1699613077628 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE plans_temp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        days TEXT NOT NULL,
        workouts TEXT NOT NULL,
        title TEXT
      )
    `);

    await queryRunner.query(`
      INSERT INTO plans_temp (id,days,workouts,title)
      SELECT id,days,workouts,title
      FROM plans
    `);

    await queryRunner.query(`
      DROP TABLE plans
    `);

    await queryRunner.query(`
      CREATE TABLE plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        days TEXT NOT NULL,
        exercises TEXT NOT NULL,
        title TEXT
      )
    `);

    await queryRunner.query(`
      INSERT INTO plans (id,days,exercises,title)
      SELECT id,days,workouts,title
      FROM plans_temp
    `);

    await queryRunner.query(`DROP TABLE plans_temp`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
