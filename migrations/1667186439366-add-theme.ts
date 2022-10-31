import {MigrationInterface, QueryRunner} from 'typeorm';

export class addTheme1667186439366 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE settings ADD COLUMN theme TEXT
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'theme');
  }
}
