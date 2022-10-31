import {MigrationInterface, QueryRunner} from 'typeorm';

export class settings1667186130041 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS settings (
        minutes INTEGER NOT NULL DEFAULT 3,
        seconds INTEGER NOT NULL DEFAULT 30,
        alarm BOOLEAN NOT NULL DEFAULT 0,
        vibrate BOOLEAN NOT NULL DEFAULT 1,
        sets INTEGER NOT NULL DEFAULT 3
      )
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('settings');
  }
}
