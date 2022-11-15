import {MigrationInterface, QueryRunner} from 'typeorm'

export class addColor1667186320954 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query('ALTER TABLE settings ADD COLUMN color TEXT NULL')
      .catch(() => null)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'color')
  }
}
