import {MigrationInterface, QueryRunner} from 'typeorm';

export class addHidden1667186159379 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE sets ADD COLUMN hidden DEFAULT false
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('sets', 'hidden');
  }
}
