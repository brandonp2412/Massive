import { DataSource } from "typeorm";
import GymSet from "./gym-set";
import { Sets1667185586014 as sets1667185586014 } from "./migrations/1667185586014-sets";
import { plans1667186124792 } from "./migrations/1667186124792-plans";
import { settings1667186130041 } from "./migrations/1667186130041-settings";
import { addSound1667186139844 } from "./migrations/1667186139844-add-sound";
import { addHidden1667186159379 } from "./migrations/1667186159379-add-hidden";
import { addNotify1667186166140 } from "./migrations/1667186166140-add-notify";
import { addImage1667186171548 } from "./migrations/1667186171548-add-image";
import { addImages1667186179488 } from "./migrations/1667186179488-add-images";
import { insertSettings1667186203827 } from "./migrations/1667186203827-insert-settings";
import { addSteps1667186211251 } from "./migrations/1667186211251-add-steps";
import { addSets1667186250618 } from "./migrations/1667186250618-add-sets";
import { addMinutes1667186255650 } from "./migrations/1667186255650-add-minutes";
import { addSeconds1667186259174 } from "./migrations/1667186259174-add-seconds";
import { addShowUnit1667186265588 } from "./migrations/1667186265588-add-show-unit";
import { addColor1667186320954 } from "./migrations/1667186320954-add-color";
import { addSteps1667186348425 } from "./migrations/1667186348425-add-steps";
import { addDate1667186431804 } from "./migrations/1667186431804-add-date";
import { addShowDate1667186435051 } from "./migrations/1667186435051-add-show-date";
import { addTheme1667186439366 } from "./migrations/1667186439366-add-theme";
import { addShowSets1667186443614 } from "./migrations/1667186443614-add-show-sets";
import { addSetsCreated1667186451005 } from "./migrations/1667186451005-add-sets-created";
import { addNoSound1667186456118 } from "./migrations/1667186456118-add-no-sound";
import { dropMigrations1667190214743 } from "./migrations/1667190214743-drop-migrations";
import { splitColor1669420187764 } from "./migrations/1669420187764-split-color";
import { addBackup1678334268359 } from "./migrations/1678334268359-add-backup";
import { planTitle1692654882408 } from "./migrations/1692654882408-plan-title";
import { weight1697766633971 } from "./migrations/1697766633971-weight";
import { exercises1699508495726 } from "./migrations/1699508495726-exercises";
import { exercisesFix1699613077628 } from "./migrations/1699613077628-exercises-fix";
import { settingsDuration1699743753975 } from "./migrations/1699743753975-settings-duration";
import { settingsStartup1699783784680 } from "./migrations/1699783784680-settings-startup";
import { settingsBackupDir1699839054226 } from "./migrations/1699839054226-settings-backup-dir";
import { homeHistoryStartup1699853245534 } from "./migrations/1699853245534-home-history-startup";
import { autoConvert1699948105001 } from "./migrations/1699948105001-auto-convert";
import { Plan } from "./plan";
import Settings from "./settings";
import Weight from "./weight";
import { settingsDefaultSets1700009253976 } from "./migrations/1700009253976-settings-default-sets";
import { settingsDefaults1700009729468 } from "./migrations/1700009729468-settings-defaults";
import { leadingZeros1707094662099 } from "./migrations/1707094662099-leading-zeros";

export const AppDataSource = new DataSource({
  type: "react-native",
  database: "massive.db",
  location: "default",
  entities: [GymSet, Plan, Settings, Weight],
  migrationsRun: true,
  migrationsTableName: "typeorm_migrations",
  migrations: [
    sets1667185586014,
    plans1667186124792,
    settings1667186130041,
    addSound1667186139844,
    addHidden1667186159379,
    addNotify1667186166140,
    addImage1667186171548,
    addImages1667186179488,
    insertSettings1667186203827,
    addSteps1667186211251,
    addSets1667186250618,
    addMinutes1667186255650,
    addSeconds1667186259174,
    addShowUnit1667186265588,
    addColor1667186320954,
    addSteps1667186348425,
    addDate1667186431804,
    addShowDate1667186435051,
    addTheme1667186439366,
    addShowSets1667186443614,
    addSetsCreated1667186451005,
    addNoSound1667186456118,
    dropMigrations1667190214743,
    splitColor1669420187764,
    addBackup1678334268359,
    planTitle1692654882408,
    weight1697766633971,
    exercises1699508495726,
    exercisesFix1699613077628,
    settingsDuration1699743753975,
    settingsStartup1699783784680,
    settingsBackupDir1699839054226,
    homeHistoryStartup1699853245534,
    autoConvert1699948105001,
    settingsDefaultSets1700009253976,
    settingsDefaults1700009729468,
    leadingZeros1707094662099,
  ],
});
