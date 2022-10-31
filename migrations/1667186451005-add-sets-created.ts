import {MigrationInterface, QueryRunner} from 'typeorm'

export class addSetsCreated1667186451005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .query(`CREATE INDEX sets_created ON sets(created)`)
      .catch(() => null)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('sets', 'sets_created')
  }
}
