import {MigrationInterface, QueryRunner} from 'typeorm'

export class splitColor1669420187764 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE settings ADD lightColor TEXT')
    await queryRunner.query('ALTER TABLE settings ADD darkColor TEXT')
    await queryRunner.dropColumn('settings', 'color').catch(console.error)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'darkColor')
    await queryRunner.dropColumn('settings', 'lightColor')
    await queryRunner.query('ALTER TABLE settings ADD color TEXT')
  }
}
