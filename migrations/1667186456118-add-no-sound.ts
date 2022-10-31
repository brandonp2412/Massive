import {MigrationInterface, QueryRunner} from 'typeorm'

export class addNoSound1667186456118 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query(`ALTER TABLE settings ADD COLUMN noSound BOOLEAN DEFAULT false`)
      .catch(() => null)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'noSound')
  }
}
