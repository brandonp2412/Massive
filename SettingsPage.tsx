import {NavigationProp, useNavigation} from '@react-navigation/native'
import {format} from 'date-fns'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {NativeModules, View} from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import {Dirs, FileSystem} from 'react-native-file-access'
import {Button, Subheading} from 'react-native-paper'
import ConfirmDialog from './ConfirmDialog'
import {ITEM_PADDING, MARGIN} from './constants'
import {AppDataSource} from './data-source'
import {setRepo, settingsRepo} from './db'
import {DrawerParamList} from './drawer-param-list'
import DrawerHeader from './DrawerHeader'
import Input from './input'
import {darkOptions, lightOptions, themeOptions} from './options'
import Page from './Page'
import Select from './Select'
import Settings from './settings'
import Switch from './Switch'
import {toast} from './toast'
import {useTheme} from './use-theme'

const defaultFormats = ['P', 'Pp', 'ccc p', 'p']

export default function SettingsPage() {
  const [ignoring, setIgnoring] = useState(false)
  const [term, setTerm] = useState('')
  const [formatOptions, setFormatOptions] = useState<string[]>(defaultFormats)
  const [importing, setImporting] = useState(false)
  const [settings, setSettings] = useState(new Settings())
  const {reset} = useNavigation<NavigationProp<DrawerParamList>>()
  const today = new Date()

  const {theme, setTheme, lightColor, setLightColor, darkColor, setDarkColor} =
    useTheme()

  useEffect(() => {
    settingsRepo.findOne({where: {}}).then(setSettings)
    NativeModules.SettingsModule.ignoringBattery(setIgnoring)
    NativeModules.SettingsModule.is24().then((is24: boolean) => {
      console.log(`${SettingsPage.name}.focus:`, {is24})
      if (is24) setFormatOptions(['P', 'P, k:m', 'ccc k:m', 'k:m'])
      else setFormatOptions(defaultFormats)
    })
  }, [])

  const soundString = useMemo(() => {
    if (!settings.sound) return null
    const split = settings.sound.split('/')
    return split.pop()
  }, [settings.sound])

  const changeAlarmEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled) toast('Timers will now run after each set.')
      else toast('Stopped timers running after each set.')
      if (enabled && !ignoring) NativeModules.SettingsModule.ignoreBattery()
      const updated = await settingsRepo.save({...settings, alarm: enabled})
      setSettings(updated)
    },
    [settings, ignoring],
  )

  const changeVibrate = useCallback(
    async (enabled: boolean) => {
      if (enabled) toast('When a timer completes, vibrate your phone.')
      else toast('Stop vibrating at the end of timers.')
      const updated = await settingsRepo.save({...settings, vibrate: enabled})
      setSettings(updated)
    },
    [settings],
  )

  const changeSound = useCallback(async () => {
    const {fileCopyUri} = await DocumentPicker.pickSingle({
      type: 'audio/*',
      copyTo: 'documentDirectory',
    })
    if (!fileCopyUri) return
    const updated = await settingsRepo.save({...settings, sound: fileCopyUri})
    setSettings(updated)
    toast('Sound will play after rest timers.')
  }, [settings])

  const changeNotify = useCallback(
    async (enabled: boolean) => {
      const updated = await settingsRepo.save({...settings, notify: enabled})
      setSettings(updated)
      if (enabled) toast('Show when a set is a new record.')
      else toast('Stopped showing notifications for new records.')
    },
    [settings],
  )

  const changeImages = useCallback(
    async (enabled: boolean) => {
      const updated = await settingsRepo.save({...settings, images: enabled})
      setSettings(updated)
      if (enabled) toast('Show images for sets.')
      else toast('Stopped showing images for sets.')
    },
    [settings],
  )

  const changeUnit = useCallback(
    async (enabled: boolean) => {
      const updated = await settingsRepo.save({...settings, showUnit: enabled})
      setSettings(updated)
      if (enabled) toast('Show option to select unit for sets.')
      else toast('Hid unit option for sets.')
    },
    [settings],
  )

  const changeSteps = useCallback(
    async (enabled: boolean) => {
      const updated = await settingsRepo.save({...settings, steps: enabled})
      setSettings(updated)
      if (enabled) toast('Show steps for a workout.')
      else toast('Stopped showing steps for workouts.')
    },
    [settings],
  )

  const changeShowDate = useCallback(
    async (enabled: boolean) => {
      const updated = await settingsRepo.save({...settings, showDate: enabled})
      setSettings(updated)
      if (enabled) toast('Show date for sets by default.')
      else toast('Stopped showing date for sets by default.')
    },
    [settings],
  )

  const changeNoSound = useCallback(
    async (enabled: boolean) => {
      const updated = await settingsRepo.save({...settings, noSound: enabled})
      setSettings(updated)
      if (enabled) toast('Disable sound on rest timer alarms.')
      else toast('Enabled sound for rest timer alarms.')
    },
    [settings],
  )

  const switches: Input<boolean>[] = [
    {name: 'Rest timers', value: settings.alarm, onChange: changeAlarmEnabled},
    {name: 'Vibrate', value: settings.vibrate, onChange: changeVibrate},
    {name: 'Disable sound', value: settings.noSound, onChange: changeNoSound},
    {name: 'Notifications', value: settings.notify, onChange: changeNotify},
    {name: 'Show images', value: settings.images, onChange: changeImages},
    {name: 'Show unit', value: settings.showUnit, onChange: changeUnit},
    {name: 'Show steps', value: settings.steps, onChange: changeSteps},
    {name: 'Show date', value: settings.showDate, onChange: changeShowDate},
  ].filter(({name}) => name.toLowerCase().includes(term.toLowerCase()))

  const changeTheme = useCallback(
    (value: string) => {
      settingsRepo.update({}, {theme: value})
      setTheme(value)
    },
    [setTheme],
  )

  const changeDate = useCallback(
    async (value: string) => {
      const updated = await settingsRepo.save({...settings, date: value})
      setSettings(updated)
      toast('Changed date format.')
    },
    [settings],
  )

  const changeDarkColor = useCallback(
    (value: string) => {
      setDarkColor(value)
      settingsRepo.update({}, {darkColor: value})
      toast('Set primary color for dark mode.')
    },
    [setDarkColor],
  )

  const changeLightColor = useCallback(
    (value: string) => {
      setLightColor(value)
      settingsRepo.update({}, {lightColor: value})
      toast('Set primary color for light mode.')
    },
    [setLightColor],
  )

  const renderSwitch = useCallback(
    (item: Input<boolean>) => (
      <Switch key={item.name} value={item.value} onChange={item.onChange}>
        {item.name}
      </Switch>
    ),
    [],
  )

  const selects: Input<string>[] = [
    {name: 'Theme', value: theme, onChange: changeTheme, items: themeOptions},
    {
      name: 'Dark color',
      value: darkColor,
      onChange: changeDarkColor,
      items: lightOptions,
    },
    {
      name: 'Light color',
      value: lightColor,
      onChange: changeLightColor,
      items: darkOptions,
    },
    {
      name: 'Date format',
      value: settings.date,
      onChange: changeDate,
      items: formatOptions.map(option => ({
        label: format(today, option),
        value: option,
      })),
    },
  ].filter(({name}) => name.toLowerCase().includes(term.toLowerCase()))

  const renderSelect = useCallback(
    (item: Input<string>) => (
      <Select
        key={item.name}
        value={item.value}
        onChange={item.onChange}
        label={item.name}
        items={item.items}
      />
    ),
    [],
  )

  const confirmImport = useCallback(async () => {
    setImporting(false)
    await AppDataSource.destroy()
    const result = await DocumentPicker.pickSingle()
    await FileSystem.cp(result.uri, Dirs.DatabaseDir + '/massive.db')
    await AppDataSource.initialize()
    await setRepo.createQueryBuilder().update().set({image: null}).execute()
    await settingsRepo
      .createQueryBuilder()
      .update()
      .set({sound: null})
      .execute()
    reset({index: 0, routes: [{name: 'Settings'}]})
  }, [reset])

  const exportDatabase = useCallback(async () => {
    const path = Dirs.DatabaseDir + '/massive.db'
    await FileSystem.cpExternal(path, 'massive.db', 'downloads')
    toast('Database exported. Check downloads.')
  }, [])

  const buttons = useMemo(
    () =>
      [
        {
          name: 'Alarm sound',
          element: (
            <View
              key="alarm-sound"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: ITEM_PADDING,
              }}>
              <Subheading style={{width: 100}}>Alarm sound</Subheading>
              <Button onPress={changeSound}>{soundString || 'Default'}</Button>
            </View>
          ),
        },
        {
          name: 'Export database',
          element: (
            <Button
              key="export-db"
              style={{alignSelf: 'flex-start'}}
              onPress={exportDatabase}>
              Export database
            </Button>
          ),
        },
        {
          name: 'Import database',
          element: (
            <Button
              key="import-db"
              style={{alignSelf: 'flex-start'}}
              onPress={() => setImporting(true)}>
              Import database
            </Button>
          ),
        },
      ].filter(({name}) => name.toLowerCase().includes(term.toLowerCase())),
    [changeSound, exportDatabase, soundString, term],
  )

  return (
    <>
      <DrawerHeader name="Settings" />

      <Page term={term} search={setTerm} style={{flexGrow: 0}}>
        <View style={{marginTop: MARGIN}}>
          {switches.map(s => renderSwitch(s))}
          {selects.map(s => renderSelect(s))}
          {buttons.map(b => b.element)}
        </View>
      </Page>

      <ConfirmDialog
        title="Are you sure?"
        onOk={confirmImport}
        setShow={setImporting}
        show={importing}>
        Importing a database overwrites your current data. This action cannot be
        reversed!
      </ConfirmDialog>
    </>
  )
}
