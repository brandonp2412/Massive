import {MigrationInterface, QueryRunner} from 'typeorm'
import {settingsRepo} from '../db'

export class updateDate1668215159730 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    const settings = await settingsRepo.findOne({where: {}})
    let newDate = 'P'
    switch (settings.date) {
      case '%Y-%m-%d %H:%M':
      case '%d/%m/%y %h:%M %p':
      case '%d/%m %h:%M %p':
        newDate = 'Pp'
        break
      case '%Y-%m-%d':
      case '%d/%m/%y':
      case '%d/%m':
        newDate = 'P'
        break
      case '%H:%M':
      case '%h:%M %p':
        newDate = 'p'
        break
      case '%A %h:%M %p':
        newDate = 'cccc p'
        break
    }
    settings.date = newDate
    await settingsRepo.save(settings)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
