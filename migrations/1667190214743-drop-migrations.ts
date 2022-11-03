import {MigrationInterface, QueryRunner, Table, TableColumn} from 'typeorm'

export class dropMigrations1667190214743 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('migrations').catch(() => null)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'migrations',
        columns: [
          new TableColumn({name: 'id', type: 'integer'}),
          new TableColumn({name: 'command', type: 'text'}),
        ],
      }),
    )
  }
}
