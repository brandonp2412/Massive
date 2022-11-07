import {Picker} from '@react-native-picker/picker'
import {useFocusEffect} from '@react-navigation/native'
import {useCallback, useMemo, useState} from 'react'
import {DeviceEventEmitter, FlatList, NativeModules, View} from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import {Button} from 'react-native-paper'
import {darkColors, lightColors} from './colors'
import ConfirmDialog from './ConfirmDialog'
import {MARGIN} from './constants'
import {settingsRepo} from './db'
import DrawerHeader from './DrawerHeader'
import Input from './input'
import Page from './Page'
import Select from './Select'
import Switch from './Switch'
import {toast} from './toast'
import {useTheme} from './use-theme'

export default function SettingsPage() {
  const [battery, setBattery] = useState(false)
  const [ignoring, setIgnoring] = useState(false)
  const [term, setTerm] = useState('')
  const [vibrate, setVibrate] = useState(false)
  const [alarm, setAlarm] = useState(false)
  const [sound, setSound] = useState('')
  const [notify, setNotify] = useState(false)
  const [images, setImages] = useState(false)
  const [showUnit, setShowUnit] = useState(false)
  const [steps, setSteps] = useState(false)
  const [date, setDate] = useState('%Y-%m-%d %H:%M')
  const {theme, setTheme, color, setColor} = useTheme()
  const [showDate, setShowDate] = useState(false)
  const [noSound, setNoSound] = useState(false)

  useFocusEffect(
    useCallback(() => {
      NativeModules.AlarmModule.ignoringBattery(setIgnoring)
      settingsRepo.findOne({where: {}}).then(settings => {
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
      if (enabled && !ignoring) setBattery(true)
      setAlarm(enabled)
      settingsRepo.update({}, {alarm: enabled})
    },
    [setBattery, ignoring],
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

  const switches: Input<boolean>[] = useMemo(
    () =>
      [
        {name: 'Rest timers', value: alarm, onChange: changeAlarmEnabled},
        {name: 'Vibrate', value: vibrate, onChange: changeVibrate},
        {name: 'Disable sound', value: noSound, onChange: changeNoSound},
        {name: 'Notifications', value: notify, onChange: changeNotify},
        {name: 'Show images', value: images, onChange: changeImages},
        {name: 'Show unit', value: showUnit, onChange: changeUnit},
        {name: 'Show steps', value: steps, onChange: changeSteps},
        {name: 'Show date', value: showDate, onChange: changeShowDate},
      ].filter(({name}) => name.toLowerCase().includes(term.toLowerCase())),
    [
      term,
      showDate,
      changeShowDate,
      alarm,
      changeAlarmEnabled,
      vibrate,
      changeVibrate,
      noSound,
      changeNoSound,
      notify,
      changeNotify,
      images,
      changeImages,
      showUnit,
      changeUnit,
      steps,
      changeSteps,
    ],
  )

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
    return ': ' + split.pop()
  }, [sound])

  const changeColor = useCallback(
    (value: string) => {
      setColor(value)
      settingsRepo.update({}, {color: value})
    },
    [setColor],
  )

  const renderItem = useCallback(
    ({item}: {item: Input<boolean>}) => (
      <Switch
        onPress={() => item.onChange(!item.value)}
        key={item.name}
        value={item.value}
        onValueChange={item.onChange}>
        {item.name}
      </Switch>
    ),
    [],
  )

  return (
    <>
      <DrawerHeader name="Settings" />
      <Page term={term} search={setTerm}>
        <View>
          <FlatList
            style={{marginTop: MARGIN}}
            data={switches}
            renderItem={renderItem}
          />
          <View style={{marginBottom: MARGIN}} />
          {'theme'.includes(term.toLowerCase()) && (
            <Select value={theme} onChange={changeTheme}>
              <Picker.Item value="system" label="Follow system theme" />
              <Picker.Item value="dark" label="Dark theme" />
              <Picker.Item value="light" label="Light theme" />
            </Select>
          )}
          {'color'.includes(term.toLowerCase()) && (
            <Select value={color} onChange={changeColor}>
              {lightColors.concat(darkColors).map(colorOption => (
                <Picker.Item
                  key={colorOption}
                  value={colorOption}
                  label="Primary color"
                  color={colorOption}
                />
              ))}
            </Select>
          )}
          {'date format'.includes(term.toLowerCase()) && (
            <Select value={date} onChange={changeDate}>
              <Picker.Item value="%Y-%m-%d %H:%M" label="1990-12-24 15:05" />
              <Picker.Item value="%Y-%m-%d" label="1990-12-24" />
              <Picker.Item value="%d/%m" label="24/12 (dd/MM)" />
              <Picker.Item value="%H:%M" label="15:05 (24-hour time)" />
              <Picker.Item value="%h:%M %p" label="3:05 PM (12-hour time)" />
              <Picker.Item value="%d/%m/%y" label="24/12/1996" />
              <Picker.Item value="%A %h:%M %p" label="Monday 3:05 PM" />
              <Picker.Item
                value="%d/%m/%y %h:%M %p"
                label="24/12/1990 3:05 PM"
              />
              <Picker.Item value="%d/%m %h:%M %p" label="24/12 3:05 PM" />
            </Select>
          )}
          {'alarm sound'.includes(term.toLowerCase()) && (
            <Button style={{alignSelf: 'flex-start'}} onPress={changeSound}>
              Alarm sound{soundString}
            </Button>
          )}
        </View>
        <ConfirmDialog
          title="Battery optimizations"
          show={battery}
          setShow={setBattery}
          onOk={() => {
            NativeModules.AlarmModule.ignoreBattery()
            setBattery(false)
          }}>
          Disable battery optimizations for Massive to use rest timers.
        </ConfirmDialog>
      </Page>
    </>
  )
}
