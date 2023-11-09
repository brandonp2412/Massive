import { MigrationInterface, QueryRunner } from "typeorm";

export class exercises1699508495726 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE plans ADD COLUMN exercises TEXT`);
    await queryRunner.query(`UPDATE plans SET exercises = workouts`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
