import { MigrationInterface, QueryRunner } from "typeorm";
import { settingsRepo } from "../db";

export class leadingZeros1707094662099 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const settings = await settingsRepo.find();
    const setting = settings[0];
    console.log(`Going from date: ${setting.date}`);

    switch (setting.date) {
      case "dd/LL/yyyy, k:m":
        setting.date = "dd/LL/yyyy, k:mm";
        break;
      case "ccc k:m":
        setting.date = "ccc k:mm";
        break;
      case "k:m":
        setting.date = "k:mm";
        break;
      case "yyyy-MM-d, p":
        setting.date = "yyyy-MM-dd, p";
        break;
      case "yyyy-MM-d":
        setting.date = "yyyy-MM-dd";
        break;
      case "yyyy-MM-d, k:m":
        setting.date = "yyyy-MM-dd, k:mm";
        break;
      case "yyyy.MM.d":
        setting.date = "yyyy.MM.dd";
        break;
    }

    console.log(`To date: ${setting.date}`);
    await settingsRepo.save(setting);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
