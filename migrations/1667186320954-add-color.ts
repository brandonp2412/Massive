import {MigrationInterface, QueryRunner, TableColumn} from 'typeorm'
import {darkColors} from '../colors'

export class addColor1667186320954 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .addColumn(
        'settings',
        new TableColumn({
          name: 'color',
          type: 'text',
          isNullable: false,
          default: `'${darkColors[0].hex}'`,
        }),
      )
      .catch(console.error)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('settings', 'color')
  }
}
