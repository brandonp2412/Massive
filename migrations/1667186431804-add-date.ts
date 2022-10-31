import {MigrationInterface, QueryRunner} from 'typeorm';

export class addDate1667186431804 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE settings ADD COLUMN date TEXT NULL
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'date');
  }
}
