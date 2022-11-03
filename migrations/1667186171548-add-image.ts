import {MigrationInterface, QueryRunner} from 'typeorm'

export class addImage1667186171548 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query('ALTER TABLE sets ADD COLUMN image TEXT NULL')
      .catch(() => null)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('sets', 'image')
  }
}
