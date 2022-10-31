import {MigrationInterface, QueryRunner} from 'typeorm';

export class addSets1667186250618 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE sets ADD COLUMN sets INTEGER NOT NULL DEFAULT 3
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('sets', 'sets');
  }
}
