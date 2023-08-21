import { MigrationInterface, QueryRunner } from "typeorm";

export class planTitle1692654882408 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query("ALTER TABLE plans ADD COLUMN title TEXT")
      .catch(() => null);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("plans", "title");
  }
}
