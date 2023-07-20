import { NavigationProp, useNavigation } from '@react-navigation/native'
import { format } from 'date-fns'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { NativeModules, ScrollView } from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import { Dirs, FileSystem } from 'react-native-file-access'
import ConfirmDialog from './ConfirmDialog'
import { MARGIN } from './constants'
import { AppDataSource } from './data-source'
import { setRepo, settingsRepo } from './db'
import { DrawerParamList } from './drawer-param-list'
import DrawerHeader from './DrawerHeader'
import Input from './input'
import { darkOptions, lightOptions, themeOptions } from './options'
import Page from './Page'
import Select from './Select'
import SettingButton from './SettingButton'
import Settings from './settings'
import Switch from './Switch'
import { toast } from './toast'
import { useTheme } from './use-theme'

const twelveHours = [
  'dd/LL/yyyy',
  'dd/LL/yyyy, p',
  'ccc p',
  'p',
  'yyyy-MM-d',
  'yyyy-MM-d, p',
  'yyyy.MM.d',
]
const twentyFours = [
  'dd/LL/yyyy',
  'dd/LL/yyyy, k:m',
  'ccc k:m',
  'k:m',
  'yyyy-MM-d',
  'yyyy-MM-d, k:m',
  'yyyy.MM.d',
]

export default function SettingsPage() {
  const [ignoring, setIgnoring] = useState(false)
  const [term, setTerm] = useState('')
  const [formatOptions, setFormatOptions] = useState<string[]>(twelveHours)
  const [importing, setImporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { reset } = useNavigation<NavigationProp<DrawerParamList>>()

  const { watch, setValue } = useForm<Settings>({
    defaultValues: () => settingsRepo.findOne({ where: {} }),
  })
  const settings = watch()

  const {
    theme,
    setTheme,
    lightColor,
    setLightColor,
    darkColor,
    setDarkColor,
  } = useTheme()

  useEffect(() => {
    NativeModules.SettingsModule.ignoringBattery(setIgnoring)
    NativeModules.SettingsModule.is24().then((is24: boolean) => {
      console.log(`${SettingsPage.name}.focus:`, { is24 })
      if (is24) setFormatOptions(twentyFours)
      else setFormatOptions(twelveHours)
    })
  }, [])

  const update = useCallback((key: keyof Settings, value: unknown) => {
    return settingsRepo
      .createQueryBuilder()
      .update()
      .set({ [key]: value })
      .printSql()
      .execute()
  }, [])

  const soundString = useMemo(() => {
    if (!settings.sound) return null
    const split = settings.sound.split('/')
    return split.pop()
  }, [settings.sound])

  const changeSound = useCallback(async () => {
    const { fileCopyUri } = await DocumentPicker.pickSingle({
      type: DocumentPicker.types.audio,
      copyTo: 'documentDirectory',
    })
    if (!fileCopyUri) return
    setValue('sound', fileCopyUri)
    await update('sound', fileCopyUri)
    toast('Sound will play after rest timers.')
  }, [setValue, update])

  const switches: Input<boolean>[] = useMemo(
    () => [
      { name: 'Rest timers', value: settings.alarm, key: 'alarm' },
      { name: 'Vibrate', value: settings.vibrate, key: 'vibrate' },
      { name: 'Disable sound', value: settings.noSound, key: 'noSound' },
      { name: 'Notifications', value: settings.notify, key: 'notify' },
      { name: 'Show images', value: settings.images, key: 'images' },
      { name: 'Show unit', value: settings.showUnit, key: 'showUnit' },
      { name: 'Show steps', value: settings.steps, key: 'steps' },
      { name: 'Show date', value: settings.showDate, key: 'showDate' },
      { name: 'Automatic backup', value: settings.backup, key: 'backup' },
    ],
    [settings],
  )

  const filter = useCallback(
    ({ name }) => name.toLowerCase().includes(term.toLowerCase()),
    [term],
  )

  const changeBoolean = useCallback(
    async (key: keyof Settings, value: boolean) => {
      setValue(key, value)
      await update(key, value)
      switch (key) {
        case 'alarm':
          if (value) toast('Timers will now run after each set.')
          else toast('Stopped timers running after each set.')
          if (value && !ignoring) NativeModules.SettingsModule.ignoreBattery()
          return
        case 'vibrate':
          if (value) toast('Alarms will now vibrate.')
          else toast('Alarms will no longer vibrate.')
          return
        case 'notify':
          if (value) toast('Show notifications for new records.')
          else toast('Stopped notifications for new records.')
          return
        case 'images':
          if (value) toast('Show images for sets.')
          else toast('Hid images for sets.')
          return
        case 'showUnit':
          if (value) toast('Show option to select unit for sets.')
          else toast('Hid unit option for sets.')
          return
        case 'steps':
          if (value) toast('Show steps for a workout.')
          else toast('Hid steps for workouts.')
          return
        case 'showDate':
          if (value) toast('Show date for sets.')
          else toast('Hid date on sets.')
          return
        case 'noSound':
          if (value) toast('Disable sound on rest timer alarms.')
          else toast('Enabled sound for rest timer alarms.')
          return
        case 'backup':
          if (value) {
            const result = await DocumentPicker.pickDirectory()
            toast('Backup database daily.')
            NativeModules.BackupModule.start(result.uri)
          } else {
            toast('Stopped backing up daily')
            NativeModules.BackupModule.stop()
          }
          return
      }
    },
    [ignoring, setValue, update],
  )

  const renderSwitch = useCallback(
    (item: Input<boolean>) => (
      <Switch
        key={item.name}
        value={item.value}
        onChange={(value) => changeBoolean(item.key, value)}
        title={item.name}
      />
    ),
    [changeBoolean],
  )

  const switchesMarkup = useMemo(
    () => switches.filter(filter).map((s) => renderSwitch(s)),
    [filter, switches, renderSwitch],
  )

  const changeString = useCallback(
    async (key: keyof Settings, value: string) => {
      setValue(key, value)
      await update(key, value)
      switch (key) {
        case 'date':
          return toast('Changed date format')
        case 'darkColor':
          setDarkColor(value)
          return toast('Set primary color for dark mode.')
        case 'lightColor':
          setLightColor(value)
          return toast('Set primary color for light mode.')
        case 'vibrate':
          return toast('Set primary color for light mode.')
        case 'sound':
          return toast('Sound will play after rest timers.')
        case 'theme':
          setTheme(value as string)
          if (value === 'dark') toast('Theme will always be dark.')
          else if (value === 'light') toast('Theme will always be light.')
          else if (value === 'system') toast('Theme will follow system.')
          return
      }
    },
    [update, setTheme, setDarkColor, setLightColor, setValue],
  )

  const selects: Input<string>[] = useMemo(() => {
    const today = new Date()
    return [
      { name: 'Theme', value: theme, items: themeOptions, key: 'theme' },
      {
        name: 'Dark color',
        value: darkColor,
        items: lightOptions,
        key: 'darkColor',
      },
      {
        name: 'Light color',
        value: lightColor,
        items: darkOptions,
        key: 'lightColor',
      },
      {
        name: 'Date format',
        value: settings.date,
        items: formatOptions.map((option) => ({
          label: format(today, option),
          value: option,
        })),
        key: 'date',
      },
    ]
  }, [settings, darkColor, formatOptions, theme, lightColor])

  const renderSelect = useCallback(
    (item: Input<string>) => (
      <Select
        key={item.name}
        value={item.value}
        onChange={(value) => changeString(item.key, value)}
        label={item.name}
        items={item.items}
      />
    ),
    [changeString],
  )

  const selectsMarkup = useMemo(
    () => selects.filter(filter).map(renderSelect),
    [filter, selects, renderSelect],
  )

  const confirmDelete = useCallback(async () => {
    setDeleting(false)
    await AppDataSource.dropDatabase()
    await AppDataSource.destroy()
    await AppDataSource.initialize()
    toast('Database deleted.')
  }, [])

  const confirmImport = useCallback(async () => {
    setImporting(false)
    await AppDataSource.destroy()
    const file = await DocumentPicker.pickSingle()
    await FileSystem.cp(file.uri, Dirs.DatabaseDir + '/massive.db')
    await AppDataSource.initialize()
    await setRepo.createQueryBuilder().update().set({ image: null }).execute()
    await update('sound', null)
    const { alarm, backup } = await settingsRepo.findOne({ where: {} })
    console.log({ backup })
    const directory = await DocumentPicker.pickDirectory()
    if (backup) NativeModules.BackupModule.start(directory.uri)
    else NativeModules.BackupModule.stop()
    NativeModules.SettingsModule.ignoringBattery(
      (isIgnoring: boolean) => {
        if (alarm && !isIgnoring) NativeModules.SettingsModule.ignoreBattery()
        reset({ index: 0, routes: [{ name: 'Settings' }] })
      },
    )
  }, [reset, update])

  const exportDatabase = useCallback(async () => {
    const path = Dirs.DatabaseDir + '/massive.db'
    await FileSystem.cpExternal(path, 'massive.db', 'downloads')
    toast('Database exported. Check downloads.')
  }, [])

  const buttons = useMemo(
    () => [
      {
        name: soundString || 'Default',
        onPress: changeSound,
        label: 'Alarm sound',
      },
      { name: 'Export database', onPress: exportDatabase },
      { name: 'Import database', onPress: () => setImporting(true) },
      { name: 'Delete database', onPress: () => setDeleting(true) },
    ],
    [changeSound, exportDatabase, soundString],
  )

  const buttonsMarkup = useMemo(
    () =>
      buttons.filter(filter).map((button) => (
        <SettingButton {...button} key={button.name} />
      )),
    [buttons, filter],
  )

  return (
    <>
      <DrawerHeader name='Settings' />

      <Page term={term} search={setTerm} style={{ flexGrow: 1 }}>
        <ScrollView style={{ marginTop: MARGIN, flex: 1 }}>
          {switchesMarkup}
          {selectsMarkup}
          {buttonsMarkup}
        </ScrollView>
      </Page>

      <ConfirmDialog
        title='Are you sure?'
        onOk={confirmImport}
        setShow={setImporting}
        show={importing}
      >
        Importing a database overwrites your current data. This action cannot be
        reversed!
      </ConfirmDialog>

      <ConfirmDialog
        title='Are you sure?'
        onOk={confirmDelete}
        setShow={setDeleting}
        show={deleting}
      >
        Deleting your database wipes your current data. This action cannot be
        reversed!
      </ConfirmDialog>
    </>
  )
}
