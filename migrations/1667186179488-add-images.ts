import {MigrationInterface, QueryRunner} from 'typeorm'

export class addImages1667186179488 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query('ALTER TABLE settings ADD COLUMN images BOOLEAN DEFAULT true')
      .catch(() => null)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'images')
  }
}
