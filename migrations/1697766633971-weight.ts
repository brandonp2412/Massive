import { MigrationInterface, QueryRunner } from "typeorm";

export class weight1697766633971 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS weights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value INTEGER NOT NULL,
        created TEXT NOT NULL, 
        unit TEXT DEFAULT 'kg'
      )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE weights");
  }
}
