import {MigrationInterface, QueryRunner} from 'typeorm'
import {settingsRepo} from '../db'

export class updateDate1668215159730 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    const settings = await settingsRepo.findOne({where: {}})
    settings.date = 'P'
    await settingsRepo.save(settings)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
