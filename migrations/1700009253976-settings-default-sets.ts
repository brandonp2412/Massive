import { MigrationInterface, QueryRunner } from "typeorm";

export class settingsDefaultSets1700009253976 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE settings ADD COLUMN defaultSets INTEGER"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
