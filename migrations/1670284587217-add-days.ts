import {MigrationInterface, QueryRunner, Table, TableColumn} from 'typeorm'

export class addDays1670284587217 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'days',
        columns: [
          new TableColumn({name: 'id', type: 'int', isPrimary: true}),
          new TableColumn({name: 'name', type: 'text', isNullable: false}),
        ],
      }),
    )
    await queryRunner.dropColumn('plans', 'days')
    await queryRunner.query(`
      INSERT INTO days VALUES 
        (1, 'Sunday'),
        (2, 'Monday'),
        (3, 'Tuesday'),
        (4, 'Wednesday'),
        (5, 'Thursday'),
        (6, 'Friday'),
        (7, 'Saturday')`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
