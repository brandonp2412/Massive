import {MigrationInterface, QueryRunner} from 'typeorm';

export class addShowDate1667186435051 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE settings ADD COLUMN showDate BOOLEAN DEFAULT false
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'showDate');
  }
}
