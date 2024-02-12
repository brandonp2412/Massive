import { NavigationProp, useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FlatList, NativeModules } from "react-native";
import DocumentPicker from "react-native-document-picker";
import { Dirs, FileSystem } from "react-native-file-access";
import { Button } from "react-native-paper";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import AppInput from "./AppInput";
import ConfirmDialog from "./ConfirmDialog";
import { PADDING } from "./constants";
import { AppDataSource } from "./data-source";
import { setRepo, settingsRepo } from "./db";
import { DrawerParams } from "./drawer-params";
import DrawerHeader from "./DrawerHeader";
import { darkOptions, lightOptions, themeOptions } from "./options";
import Page from "./Page";
import Select from "./Select";
import Settings from "./settings";
import Switch from "./Switch";
import { toast } from "./toast";
import { useAppTheme } from "./use-theme";

const twelveHours = [
  "dd/LL/yyyy",
  "dd/LL/yyyy, p",
  "ccc p",
  "p",
  "yyyy-MM-dd",
  "yyyy-MM-dd, p",
  "yyyy.MM.dd",
];

const twentyFours = [
  "dd/LL/yyyy",
  "dd/LL/yyyy, k:mm",
  "ccc k:mm",
  "k:mm",
  "yyyy-MM-dd",
  "yyyy-MM-dd, k:mm",
  "yyyy.MM.dd",
];

interface Item {
  name: string;
  renderItem: (name: string) => React.JSX.Element;
}

export default function SettingsPage() {
  const [ignoring, setIgnoring] = useState(false);
  const [term, setTerm] = useState("");
  const [formatOptions, setFormatOptions] = useState<string[]>(twelveHours);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const { reset } = useNavigation<NavigationProp<DrawerParams>>();

  const { watch, setValue } = useForm<Settings>({
    defaultValues: () => settingsRepo.findOne({ where: {} }),
  });
  const settings = watch();

  const {
    theme,
    setTheme,
    lightColor,
    setLightColor,
    darkColor,
    setDarkColor,
  } = useAppTheme();

  useEffect(() => {
    NativeModules.SettingsModule.ignoringBattery(setIgnoring);
    NativeModules.SettingsModule.is24().then((is24: boolean) => {
      console.log(`${SettingsPage.name}.focus:`, { is24 });
      if (is24) setFormatOptions(twentyFours);
      else setFormatOptions(twelveHours);
    });
  }, []);

  const backupString = useMemo(() => {
    if (!settings.backupDir) return null;
    const split = decodeURIComponent(settings.backupDir).split(":");
    return split.pop();
  }, [settings.backupDir]);

  const soundString = useMemo(() => {
    if (!settings.sound) return null;
    const split = settings.sound.split("/");
    return split.pop();
  }, [settings.sound]);

  const confirmDelete = useCallback(async () => {
    setDeleting(false);
    await AppDataSource.dropDatabase();
    await AppDataSource.destroy();
    await AppDataSource.initialize();
    toast("Database deleted.");
  }, []);

  const confirmImport = useCallback(async () => {
    setImporting(false);
    await FileSystem.cp(
      Dirs.DatabaseDir + "/massive.db",
      Dirs.DatabaseDir + "/massive-backup.db"
    );
    await AppDataSource.destroy();
    const file = await DocumentPicker.pickSingle();
    await FileSystem.cp(file.uri, Dirs.DatabaseDir + "/massive.db");

    try {
      await AppDataSource.initialize();
    } catch (e) {
      setError(e.toString());
      await FileSystem.cp(
        Dirs.DatabaseDir + "/massive-backup.db",
        Dirs.DatabaseDir + "/massive.db"
      );
      await AppDataSource.initialize();
      return;
    }

    await setRepo.update({}, { image: null });
    await settingsRepo.update({}, { sound: null, backup: false });
    reset({ index: 0, routes: [{ name: "Settings" }] });
  }, [reset]);

  const today = new Date();

  const data: Item[] = [
    {
      name: "Start up page",
      renderItem: (name: string) => (
        <Select
          label={name}
          items={[
            { label: "History", value: "History", icon: 'history' },
            { label: "Exercises", value: "Exercises", icon: 'dumbbell' },
            { label: "Plans", value: "Plans", icon: 'calendar-outline' },
            { label: "Graphs", value: "Graphs", icon: 'chart-bell-curve-cumulative' },
            { label: "Timer", value: "Timer", icon: 'timer-outline' },
            { label: "Weight", value: "Weight", icon: 'scale-bathroom' },
            { label: "Insights", value: "Insights", icon: 'lightbulb-on-outline' },
            { label: "Settings", value: "Settings", icon: 'cog-outline' },
          ]}
          value={settings.startup}
          onChange={async (value) => {
            setValue("startup", value);
            await settingsRepo.update({}, { startup: value });
            toast(`App will always start on ${value}`);
          }}
        />
      ),
    },
    {
      name: "Theme",
      renderItem: (name: string) => (
        <Select
          label={name}
          items={themeOptions}
          value={theme}
          onChange={async (value) => {
            setValue("theme", value);
            setTheme(value);
            await settingsRepo.update({}, { theme: value });
            if (value === "dark") toast("Theme will always be dark.");
            else if (value === "light") toast("Theme will always be light.");
            else if (value === "system") toast("Theme will follow system.");
          }}
        />
      ),
    },
    {
      name: "Date format",
      renderItem: (name: string) => (
        <Select
          label={name}
          items={formatOptions.map((option) => ({
            label: format(today, option),
            value: option,
          }))}
          value={settings.date}
          onChange={async (value) => {
            setValue("date", value);
            await settingsRepo.update({}, { date: value });
            toast("Changed date format.");
          }}
        />
      ),
    },
    {
      name: "Auto convert",
      renderItem: (name: string) => (
        <Select
          label={name}
          items={[
            { label: "Off", value: "", icon: 'scale-off' },
            { label: "Kilograms", value: "kg", icon: 'weight-kilogram' },
            { label: "Pounds", value: "lb", icon: 'weight-pound' },
            { label: "Stone", value: "stone", icon: 'weight' },
          ]}
          value={settings.autoConvert}
          onChange={async (value) => {
            setValue("autoConvert", value);
            await settingsRepo.update({}, { autoConvert: value });
            if (value) toast(`Sets now automatically convert to ${value}`);
            else toast("Stopped automatically converting sets.");
          }}
        />
      ),
    },
    {
      name: "Vibration duration (ms)",
      renderItem: (name: string) => (
        <AppInput
          value={settings.duration?.toString() ?? "300"}
          label={name}
          onChangeText={(value) => setValue("duration", Number(value))}
          onSubmitEditing={async (e) => {
            const value = Number(e.nativeEvent.text);
            setValue("duration", value);
            await settingsRepo.update({}, { duration: value });
            toast("Changed duration of alarm vibrations.");
          }}
          keyboardType="numeric"
          blurOnSubmit
        />
      ),
    },
    {
      name: "Default sets",
      renderItem: (name: string) => (
        <AppInput
          value={settings.defaultSets?.toString() ?? "3"}
          label={name}
          onChangeText={(value) => setValue("defaultSets", Number(value))}
          onSubmitEditing={async (e) => {
            const value = Number(e.nativeEvent.text);
            setValue("defaultSets", value);
            await settingsRepo.update({}, { defaultSets: value });
            toast(`New exercises now have ${value} sets by default.`);
          }}
          keyboardType="numeric"
          blurOnSubmit
        />
      ),
    },
    {
      name: "Default minutes",
      renderItem: (name: string) => (
        <AppInput
          value={settings.defaultMinutes?.toString() ?? "3"}
          label={name}
          onChangeText={(value) => setValue("defaultMinutes", Number(value))}
          onSubmitEditing={async (e) => {
            const value = Number(e.nativeEvent.text);
            setValue("defaultMinutes", value);
            await settingsRepo.update({}, { defaultMinutes: value });
            toast(`New exercises now wait ${value} minutes by default.`);
          }}
          keyboardType="numeric"
          blurOnSubmit
        />
      ),
    },
    {
      name: "Default seconds",
      renderItem: (name: string) => (
        <AppInput
          value={settings.defaultSeconds?.toString() ?? "30"}
          label={name}
          onChangeText={(value) => setValue("defaultSeconds", Number(value))}
          onSubmitEditing={async (e) => {
            const value = Number(e.nativeEvent.text);
            setValue("defaultSeconds", value);
            await settingsRepo.update({}, { defaultSeconds: value });
            toast(`New exercises now wait ${value} seconds by default.`);
          }}
          keyboardType="numeric"
          blurOnSubmit
        />
      ),
    },
    {
      name: "Dark color",
      renderItem: (name: string) => (
        <Select
          label={name}
          items={lightOptions}
          value={darkColor}
          onChange={async (value) => {
            setValue("darkColor", value);
            setDarkColor(value);
            await settingsRepo.update({}, { darkColor: value });
            toast("Set primary color for dark mode.");
          }}
        />
      ),
    },
    {
      name: "Light color",
      renderItem: (name: string) => (
        <Select
          label={name}
          items={darkOptions}
          value={lightColor}
          onChange={async (value) => {
            setValue("lightColor", value);
            setLightColor(value);
            await settingsRepo.update({}, { lightColor: value });
            toast("Set primary color for light mode.");
          }}
        />
      ),
    },
    {
      name: "Rest timers",
      renderItem: (name: string) => (
        <Switch
          value={settings.alarm}
          onChange={async (value) => {
            setValue("alarm", value);
            if (value && !ignoring) {
              NativeModules.SettingsModule.ignoreBattery();
            }
            await settingsRepo.update({}, { alarm: value });
            if (value) toast("Timers will now run after each set.");
            else toast("Stopped timers running after each set.");
          }}
          title={name}
        />
      ),
    },
    {
      name: "Vibrate",
      renderItem: (name: string) => (
        <Switch
          value={settings.vibrate}
          onChange={async (value) => {
            setValue("vibrate", value);
            await settingsRepo.update({}, { vibrate: value });
            if (value) toast("Timers will now run after each set.");
            else toast("Stopped timers running after each set.");
          }}
          title={name}
        />
      ),
    },
    {
      name: "Disable sound",
      renderItem: (name: string) => (
        <Switch
          value={settings.noSound}
          onChange={async (value) => {
            setValue("noSound", value);
            const silentPath = Dirs.DocumentDir + "/silent.mp3";

            if (value) {
              await FileSystem.writeFile(silentPath, "");
              setValue("sound", silentPath);
              await settingsRepo.update(
                {},
                {
                  sound: silentPath,
                  noSound: value,
                }
              );
            } else if (!value && settings.sound === silentPath) {
              setValue("sound", null);
              await settingsRepo.update({}, { sound: null, noSound: value });
            }

            if (value) toast("Alarms will no longer make a sound.");
            else toast("Enabled sound for alarms.");
          }}
          title={name}
        />
      ),
    },
    {
      name: "Notifications",
      renderItem: (name: string) => (
        <Switch
          value={settings.notify}
          onChange={async (value) => {
            setValue("notify", value);
            await settingsRepo.update({}, { notify: value });
            if (value) toast("Show notifications for new records.");
            else toast("Stopped notifications for new records.");
          }}
          title={name}
        />
      ),
    },
    {
      name: "Show images",
      renderItem: (name: string) => (
        <Switch
          value={settings.images}
          onChange={async (value) => {
            setValue("images", value);
            await settingsRepo.update({}, { images: value });
            if (value) toast("Show images for sets.");
            else toast("Hid images for sets.");
          }}
          title={name}
        />
      ),
    },
    {
      name: "Show unit",
      renderItem: (name: string) => (
        <Switch
          value={settings.showUnit}
          onChange={async (value) => {
            setValue("showUnit", value);
            await settingsRepo.update({}, { showUnit: value });
            if (value) toast("Show option to select unit for sets.");
            else toast("Hid unit option for sets.");
          }}
          title={name}
        />
      ),
    },
    {
      name: "Show steps",
      renderItem: (name: string) => (
        <Switch
          value={settings.steps}
          onChange={async (value) => {
            setValue("steps", value);
            await settingsRepo.update({}, { steps: value });
            if (value) toast("Show steps for exercises.");
            else toast("Hid steps for exercises.");
          }}
          title={name}
        />
      ),
    },
    {
      name: "Show date",
      renderItem: (name: string) => (
        <Switch
          value={settings.showDate}
          onChange={async (value) => {
            setValue("showDate", value);
            await settingsRepo.update({}, { showDate: value });
            if (value) toast("Show date for sets.");
            else toast("Hid date on sets.");
          }}
          title={name}
        />
      ),
    },
    {
      name: "Automatic backup",
      renderItem: (name: string) => (
        <Switch
          value={settings.backup}
          onChange={async (value) => {
            setValue("backup", value);
            await settingsRepo.update({}, { backup: value });
            if (value) {
              const result = await DocumentPicker.pickDirectory();
              setValue("backupDir", result.uri);
              await settingsRepo.update({}, { backupDir: result.uri });
              console.log(`${SettingsPage.name}.backup:`, { result });
              toast("Backup database daily.");
              NativeModules.BackupModule.start(result.uri);
            } else {
              toast("Stopped backing up daily");
              NativeModules.BackupModule.stop();
            }
          }}
          title={name}
        />
      ),
    },
    {
      name: `Backup directory: ${backupString || "Not set yet!"}`,
      renderItem: (name: string) => (
        <Button
          style={{ alignSelf: "flex-start" }}
          onPress={async () => {
            const result = await DocumentPicker.pickDirectory();
            setValue("backupDir", result.uri);
            await settingsRepo.update({}, { backupDir: result.uri });
            toast("Changed backup directory.");
            if (!settings.backup) return;
            NativeModules.BackupModule.stop();
            NativeModules.BackupModule.start(result.uri);
          }}
        >
          {name}
        </Button>
      ),
    },
    {
      name: `Alarm sound: ${soundString || "Default"}`,
      renderItem: (name: string) => (
        <Button
          style={{ alignSelf: "flex-start" }}
          onPress={async () => {
            const { fileCopyUri } = await DocumentPicker.pickSingle({
              type: DocumentPicker.types.audio,
              copyTo: "documentDirectory",
            });
            if (!fileCopyUri) return;
            setValue("sound", fileCopyUri);
            await settingsRepo.update({}, { sound: fileCopyUri });
            toast("Sound will play after rest timers.");
          }}
        >
          {name}
        </Button>
      ),
    },
    {
      name: "Export database",
      renderItem: (name: string) => (
        <Button
          style={{ alignSelf: "flex-start" }}
          onPress={async () => {
            let target = settings.backupDir
            if (!FileSystem.exists(target)) {
              const result = await DocumentPicker.pickDirectory();
              target = result.uri
              setValue("backupDir", result.uri);
            }
            const error = await NativeModules.BackupModule.once(target);
            if (error) toast(error);
            else toast("Database exported.");
          }}
        >
          {name}
        </Button>
      ),
    },
    {
      name: "Export sets as CSV",
      renderItem: (name: string) => (
        <Button
          style={{ alignSelf: "flex-start" }}
          onPress={async () => {
            let target = settings.backupDir
            if (!target || !FileSystem.exists(target)) {
              const result = await DocumentPicker.pickDirectory();
              target = result.uri
              setValue("backupDir", result.uri);
            }
            await NativeModules.BackupModule.exportToCSV(target);
            toast("Exported sets as CSV.");
          }}
        >
          {name}
        </Button>
      ),
    },
    {
      name: "Import database",
      renderItem: (name: string) => (
        <Button
          style={{ alignSelf: "flex-start" }}
          onPress={() => setImporting(true)}
        >
          {name}
        </Button>
      ),
    },
    {
      name: "Delete database",
      renderItem: (name: string) => (
        <Button
          style={{ alignSelf: "flex-start" }}
          onPress={() => setDeleting(true)}
        >
          {name}
        </Button>
      ),
    },
  ];

  return (
    <>
      <DrawerHeader name="Settings" />

      <Page term={term} search={setTerm}>
        <FlatList
          data={data.filter((item) =>
            item.name.toLowerCase().includes(term.toLowerCase())
          )}
          renderItem={({ item }) => item.renderItem(item.name)}
          style={{ flex: 1, paddingTop: PADDING }}
        />
      </Page>

      <ConfirmDialog
        title="Failed to import database"
        onOk={() => setError("")}
        setShow={() => setError("")}
        show={!!error}
      >
        {error}
      </ConfirmDialog>

      <ConfirmDialog
        title="Are you sure?"
        onOk={confirmImport}
        setShow={setImporting}
        show={importing}
      >
        Importing a database overwrites your current data. This action cannot be
        reversed!
      </ConfirmDialog>

      <ConfirmDialog
        title="Are you sure?"
        onOk={confirmDelete}
        setShow={setDeleting}
        show={deleting}
      >
        Deleting your database wipes your current data. This action cannot be
        reversed!
      </ConfirmDialog>
    </>
  );
}
