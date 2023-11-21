import { MigrationInterface, QueryRunner } from "typeorm";

export class addSteps1667186211251 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query("ALTER TABLE settings ADD COLUMN steps BOOLEAN DEFAULT false")
      .catch(() => null);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("settings", "steps");
  }
}
