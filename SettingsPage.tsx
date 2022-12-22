import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import {format} from 'date-fns'
import {useCallback, useMemo, useState} from 'react'
import {
  DeviceEventEmitter,
  FlatList,
  NativeModules,
  Platform,
  View,
} from 'react-native'
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
import Switch from './Switch'
import {toast} from './toast'
import {useTheme} from './use-theme'

const defaultFormats = ['P', 'Pp', 'ccc p', 'p']

export default function SettingsPage() {
  const [ignoring, setIgnoring] = useState(false)
  const [term, setTerm] = useState('')
  const [vibrate, setVibrate] = useState(false)
  const [alarm, setAlarm] = useState(false)
  const [sound, setSound] = useState('')
  const [notify, setNotify] = useState(false)
  const [images, setImages] = useState(false)
  const [showUnit, setShowUnit] = useState(false)
  const [steps, setSteps] = useState(false)
  const [date, setDate] = useState('P')
  const {theme, setTheme, lightColor, setLightColor, darkColor, setDarkColor} =
    useTheme()
  const [showDate, setShowDate] = useState(false)
  const [noSound, setNoSound] = useState(false)
  const [formatOptions, setFormatOptions] = useState<string[]>(defaultFormats)
  const [importing, setImporting] = useState(false)
  const {reset} = useNavigation<NavigationProp<DrawerParamList>>()
  const today = new Date()

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({where: {}}).then(settings => {
        console.log(`${SettingsPage.name}.focus:`, settings)
        setAlarm(settings.alarm)
        setVibrate(settings.vibrate)
        setSound(settings.sound)
        setNotify(settings.notify)
        setImages(settings.images)
        setShowUnit(settings.showUnit)
        setSteps(settings.steps)
        setDate(settings.date)
        setShowDate(settings.showDate)
        setNoSound(settings.noSound)
      })
      if (Platform.OS !== 'android') return
      NativeModules.SettingsModule.ignoringBattery(setIgnoring)
      NativeModules.SettingsModule.is24().then((is24: boolean) => {
        console.log(`${SettingsPage.name}.focus:`, {is24})
        if (is24) setFormatOptions(['P', 'P, k:m', 'ccc k:m', 'k:m'])
        else setFormatOptions(defaultFormats)
      })
    }, []),
  )

  const changeAlarmEnabled = useCallback(
    (enabled: boolean) => {
      if (enabled)
        DeviceEventEmitter.emit('toast', {
          value: 'Timers will now run after each set',
          timeout: 4000,
        })
      else toast('Stopped timers running after each set.')
      if (enabled && !ignoring) NativeModules.SettingsModule.ignoreBattery()
      setAlarm(enabled)
      settingsRepo.update({}, {alarm: enabled})
    },
    [ignoring],
  )

  const changeVibrate = useCallback((enabled: boolean) => {
    if (enabled) toast('When a timer completes, vibrate your phone.')
    else toast('Stop vibrating at the end of timers.')
    setVibrate(enabled)
    settingsRepo.update({}, {vibrate: enabled})
  }, [])

  const changeSound = useCallback(async () => {
    const {fileCopyUri} = await DocumentPicker.pickSingle({
      type: 'audio/*',
      copyTo: 'documentDirectory',
    })
    if (!fileCopyUri) return
    settingsRepo.update({}, {sound: fileCopyUri})
    setSound(fileCopyUri)
    toast('This song will now play after rest timers complete.')
  }, [])

  const changeNotify = useCallback((enabled: boolean) => {
    setNotify(enabled)
    settingsRepo.update({}, {notify: enabled})
    if (enabled) toast('Show when a set is a new record.')
    else toast('Stopped showing notifications for new records.')
  }, [])

  const changeImages = useCallback((enabled: boolean) => {
    setImages(enabled)
    settingsRepo.update({}, {images: enabled})
    if (enabled) toast('Show images for sets.')
    else toast('Stopped showing images for sets.')
  }, [])

  const changeUnit = useCallback((enabled: boolean) => {
    setShowUnit(enabled)
    settingsRepo.update({}, {showUnit: enabled})
    if (enabled) toast('Show option to select unit for sets.')
    else toast('Hid unit option for sets.')
  }, [])

  const changeSteps = useCallback((enabled: boolean) => {
    setSteps(enabled)
    settingsRepo.update({}, {steps: enabled})
    if (enabled) toast('Show steps for a workout.')
    else toast('Stopped showing steps for workouts.')
  }, [])

  const changeShowDate = useCallback((enabled: boolean) => {
    setShowDate(enabled)
    settingsRepo.update({}, {showDate: enabled})
    if (enabled) toast('Show date for sets by default.')
    else toast('Stopped showing date for sets by default.')
  }, [])

  const changeNoSound = useCallback((enabled: boolean) => {
    setNoSound(enabled)
    settingsRepo.update({}, {noSound: enabled})
    if (enabled) toast('Disable sound on rest timer alarms.')
    else toast('Enabled sound for rest timer alarms.')
  }, [])

  const switches: Input<boolean>[] = [
    {name: 'Rest timers', value: alarm, onChange: changeAlarmEnabled},
    {name: 'Vibrate', value: vibrate, onChange: changeVibrate},
    {name: 'Disable sound', value: noSound, onChange: changeNoSound},
    {name: 'Notifications', value: notify, onChange: changeNotify},
    {name: 'Show images', value: images, onChange: changeImages},
    {name: 'Show unit', value: showUnit, onChange: changeUnit},
    {name: 'Show steps', value: steps, onChange: changeSteps},
    {name: 'Show date', value: showDate, onChange: changeShowDate},
  ]

  const changeTheme = useCallback(
    (value: string) => {
      settingsRepo.update({}, {theme: value})
      setTheme(value)
    },
    [setTheme],
  )

  const changeDate = useCallback((value: string) => {
    settingsRepo.update({}, {date: value})
    setDate(value)
  }, [])

  const soundString = useMemo(() => {
    if (!sound) return null
    const split = sound.split('/')
    return split.pop()
  }, [sound])

  const changeDarkColor = useCallback(
    (value: string) => {
      setDarkColor(value)
      settingsRepo.update({}, {darkColor: value})
    },
    [setDarkColor],
  )

  const changeLightColor = useCallback(
    (value: string) => {
      setLightColor(value)
      settingsRepo.update({}, {lightColor: value})
    },
    [setLightColor],
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
      value: date,
      onChange: changeDate,
      items: formatOptions.map(option => ({
        label: format(today, option),
        value: option,
      })),
    },
  ]

  const renderSelect = useCallback(
    ({item}: {item: Input<string>}) => (
      <Select
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

  return (
    <>
      <DrawerHeader name="Settings" />
      <Page term={term} search={setTerm} style={{flexGrow: 0}}>
        <Switch
          onPress={() => changeAlarmEnabled(!alarm)}
          value={alarm}
          onValueChange={changeAlarmEnabled}>
          Rest timers
        </Switch>
        <Switch
          onPress={() => changeVibrate(!vibrate)}
          value={vibrate}
          onValueChange={changeVibrate}>
          Vibrate
        </Switch>
        <Switch
          onPress={() => changeNoSound(!noSound)}
          value={noSound}
          onValueChange={changeNoSound}>
          Disable sound
        </Switch>
        <Switch
          onPress={() => changeNotify(!notify)}
          value={notify}
          onValueChange={changeNotify}>
          Notifications
        </Switch>
        <Switch
          onPress={() => changeImages(!images)}
          value={images}
          onValueChange={changeImages}>
          Show images
        </Switch>
        <Switch
          onPress={() => changeUnit(!showUnit)}
          value={showUnit}
          onValueChange={changeUnit}>
          Show unit
        </Switch>
        <Switch
          onPress={() => changeSteps(!steps)}
          value={steps}
          onValueChange={changeSteps}>
          Show steps
        </Switch>
        <Switch
          onPress={() => changeShowDate(!showDate)}
          value={showDate}
          onValueChange={changeShowDate}>
          Show date
        </Switch>

        <FlatList data={selects} renderItem={renderSelect} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: ITEM_PADDING,
          }}>
          <Subheading style={{width: 100}}>Alarm sound</Subheading>
          <Button onPress={changeSound}>{soundString || 'Default'}</Button>
        </View>
        <Button style={{alignSelf: 'flex-start'}} onPress={exportDatabase}>
          Export database
        </Button>
        <Button
          style={{alignSelf: 'flex-start'}}
          onPress={() => setImporting(true)}>
          Import database
        </Button>
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
