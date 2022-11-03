import {MigrationInterface, QueryRunner} from 'typeorm'

export class addSeconds1667186259174 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query('ALTER TABLE sets ADD COLUMN seconds INTEGER NOT NULL DEFAULT 30')
      .catch(() => null)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('sets', 'seconds')
  }
}
