import {MigrationInterface, QueryRunner} from 'typeorm';

export class addNotify1667186166140 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE settings ADD COLUMN notify DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'notify');
  }
}
