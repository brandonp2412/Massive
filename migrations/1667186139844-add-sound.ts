import {MigrationInterface, QueryRunner} from 'typeorm'

export class addSound1667186139844 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query('ALTER TABLE settings ADD COLUMN sound TEXT NULL')
      .catch(() => null)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'sound')
  }
}
