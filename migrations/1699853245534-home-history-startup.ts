import { MigrationInterface, QueryRunner } from "typeorm";
import { settingsRepo } from "../db";

export class homeHistoryStartup1699853245534 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await settingsRepo.update({ startup: "Home" }, { startup: "History" });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
