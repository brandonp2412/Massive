import { NavigationProp, useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FlatList, NativeModules } from "react-native";
import DocumentPicker from "react-native-document-picker";
import { Dirs, FileSystem } from "react-native-file-access";
import { Button } from "react-native-paper";
import { PERMISSIONS, RESULTS, check, request } from "react-native-permissions";
import AppInput from "./AppInput";
import ConfirmDialog from "./ConfirmDialog";
import DrawerHeader from "./DrawerHeader";
import Page from "./Page";
import Select from "./Select";
import Switch from "./Switch";
import { PADDING } from "./constants";
import { AppDataSource } from "./data-source";
import { setRepo, settingsRepo } from "./db";
import { DrawerParams } from "./drawer-param-list";
import { darkOptions, lightOptions, themeOptions } from "./options";
import Settings from "./settings";
import { toast } from "./toast";
import { useAppTheme } from "./use-theme";

const twelveHours = [
  "dd/LL/yyyy",
  "dd/LL/yyyy, p",
  "ccc p",
  "p",
  "yyyy-MM-d",
  "yyyy-MM-d, p",
  "yyyy.MM.d",
];
const twentyFours = [
  "dd/LL/yyyy",
  "dd/LL/yyyy, k:m",
  "ccc k:m",
  "k:m",
  "yyyy-MM-d",
  "yyyy-MM-d, k:m",
  "yyyy.MM.d",
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

  const update = useCallback(async (key: keyof Settings, value: unknown) => {
    await settingsRepo
      .createQueryBuilder()
      .update()
      .set({ [key]: value })
      .printSql()
      .execute();
  }, []);

  const backupString = useMemo(() => {
    if (!settings.backupDir) return null;
    console.log(settings.backupDir);
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
    await AppDataSource.destroy();
    const file = await DocumentPicker.pickSingle();
    await FileSystem.cp(file.uri, Dirs.DatabaseDir + "/massive.db");
    await AppDataSource.initialize();
    await setRepo.createQueryBuilder().update().set({ image: null }).execute();
    await update("sound", null);
    await update("backup", false);
    reset({ index: 0, routes: [{ name: "Settings" }] });
  }, [reset, update]);

  const today = new Date();

  const data: Item[] = [
    {
      name: "Start up page",
      renderItem: (name: string) => (
        <Select
          label={name}
          items={[
            { label: "History", value: "History" },
            { label: "Exercises", value: "Exercises" },
            { label: "Plans", value: "Plans" },
            { label: "Graphs", value: "Graphs" },
            { label: "Timer", value: "Timer" },
            { label: "Weight", value: "Weight" },
            { label: "Insights", value: "Insights" },
            { label: "Settings", value: "Settings" },
          ]}
          value={settings.startup}
          onChange={async (value) => {
            setValue("startup", value);
            await update("startup", value);
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
            await update("theme", value);
            if (value === "dark") toast("Theme will always be dark.");
            else if (value === "light") toast("Theme will always be light.");
            else if (value === "system") toast("Theme will follow system.");
          }}
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
            await update("darkColor", value);
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
            await update("lightColor", value);
            toast("Set primary color for light mode.");
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
            await update("date", value);
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
            { label: "Off", value: "" },
            { label: "Kilograms", value: "kg" },
            { label: "Pounds", value: "lb" },
            { label: "Stone", value: "stone" },
          ]}
          value={settings.autoConvert}
          onChange={async (value) => {
            setValue("autoConvert", value);
            await update("autoConvert", value);
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
            setValue("duration", Number(e.nativeEvent.text));
            await update("duration", e.nativeEvent.text);
            toast("Changed duration of alarm vibrations.");
          }}
          keyboardType="numeric"
          blurOnSubmit
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
            if (value && !ignoring)
              NativeModules.SettingsModule.ignoreBattery();
            await update("alarm", value);
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
            await update("vibrate", value);
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
            await update("noSound", value);
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
            await update("notify", value);
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
            await update("images", value);
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
            await update("showUnit", value);
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
            await update("steps", value);
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
            await update("showDate", value);
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
            await update("backup", value);
            if (value) {
              const result = await DocumentPicker.pickDirectory();
              setValue("backupDir", result.uri);
              await update("backupDir", result.uri);
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
      name: `Backup directory: ${backupString || "Downloads"}`,
      renderItem: (name: string) => (
        <Button
          style={{ alignSelf: "flex-start" }}
          onPress={async () => {
            const result = await DocumentPicker.pickDirectory();
            setValue("backupDir", result.uri);
            await update("backupDir", result.uri);
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
            await update("sound", fileCopyUri);
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
            const result = await check(
              PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
            );
            if (result === RESULTS.DENIED || result === RESULTS.BLOCKED)
              await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
            const path = Dirs.DatabaseDir + "/massive.db";
            await FileSystem.cpExternal(path, "massive.db", "downloads");
            toast("Database exported. Check downloads.");
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
