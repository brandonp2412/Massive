import {MigrationInterface, QueryRunner} from 'typeorm'

export class Sets1667185586014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        reps INTEGER NOT NULL,
        weight INTEGER NOT NULL,
        created TEXT NOT NULL,
        unit TEXT DEFAULT 'kg'
      )
  `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE sets`)
  }
}
