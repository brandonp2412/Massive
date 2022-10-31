import {MigrationInterface, QueryRunner} from 'typeorm';

export class insertSettings1667186203827 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('INSERT INTO settings(minutes) VALUES(3)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM settings');
  }
}
