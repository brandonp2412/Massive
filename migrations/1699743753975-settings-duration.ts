import { MigrationInterface, QueryRunner } from "typeorm";

export class settingsDuration1699743753975 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query("ALTER TABLE settings ADD COLUMN duration INTEGER")
      .catch(() => null);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
