import { MigrationInterface, QueryRunner } from "typeorm";

export class settingsStartup1699783784680 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE settings ADD COLUMN startup TEXT");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
