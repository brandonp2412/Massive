import {MigrationInterface, QueryRunner} from 'typeorm'

export class addMinutes1667186255650 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query(`ALTER TABLE sets ADD COLUMN minutes INTEGER NOT NULL DEFAULT 3`)
      .catch(() => null)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('sets', 'minutes')
  }
}
