import { MigrationInterface, QueryRunner } from "typeorm";

export class settingsBackupDir1699839054226 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE settings ADD COLUMN backupDir TEXT");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
