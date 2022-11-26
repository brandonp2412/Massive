import {MigrationInterface, QueryRunner, TableColumn} from 'typeorm'

export class splitColor1669420187764 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'settings',
      new TableColumn({name: 'lightColor', type: 'text', isNullable: true}),
    )
    await queryRunner.addColumn(
      'settings',
      new TableColumn({name: 'darkColor', type: 'text', isNullable: true}),
    )
    await queryRunner.dropColumn('settings', 'color')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'darkColor')
    await queryRunner.dropColumn('settings', 'lightColor')
    await queryRunner.addColumn(
      'settings',
      new TableColumn({name: 'color', type: 'text', isNullable: true}),
    )
  }
}
