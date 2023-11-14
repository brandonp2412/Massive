import { MigrationInterface, QueryRunner } from "typeorm";

export class autoConvert1699948105001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE settings ADD COLUMN autoConvert TEXT");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
