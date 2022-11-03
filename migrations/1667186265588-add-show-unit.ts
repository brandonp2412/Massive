import {MigrationInterface, QueryRunner} from 'typeorm'

export class addShowUnit1667186265588 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query('ALTER TABLE settings ADD COLUMN showUnit BOOLEAN DEFAULT true')
      .catch(() => null)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'showUnit')
  }
}
