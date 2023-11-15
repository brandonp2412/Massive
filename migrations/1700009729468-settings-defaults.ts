import { MigrationInterface, QueryRunner } from "typeorm";

export class settingsDefaults1700009729468 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE settings ADD COLUMN defaultMinutes INTEGER"
    );
    await queryRunner.query(
      "ALTER TABLE settings ADD COLUMN defaultSeconds INTEGER"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
