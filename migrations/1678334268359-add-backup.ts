import {MigrationInterface, QueryRunner} from 'typeorm'

export class addBackup1678334268359 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query('ALTER TABLE settings ADD COLUMN backup BOOLEAN DEFAULT false')
      .catch(() => null)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'backup')
  }
}
