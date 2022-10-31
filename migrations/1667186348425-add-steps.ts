import {MigrationInterface, QueryRunner} from 'typeorm';

export class addSteps1667186348425 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE sets ADD COLUMN steps TEXT NULL
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('sets', 'steps');
  }
}
