import {MigrationInterface, QueryRunner} from 'typeorm'

export class removeShowSets1667622610740 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'showSets')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query('ALTER TABLE settings ADD COLUMN showSets BOOLEAN DEFAULT true')
      .catch(() => null)
  }
}
