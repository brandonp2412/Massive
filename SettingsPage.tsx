import {Picker} from '@react-native-picker/picker'
import {useFocusEffect} from '@react-navigation/native'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {NativeModules, ScrollView} from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import {Button} from 'react-native-paper'
import {darkColors, lightColors} from './colors'
import ConfirmDialog from './ConfirmDialog'
import {MARGIN} from './constants'
import {settingsRepo} from './db'
import DrawerHeader from './DrawerHeader'
import Input from './input'
import {useSnackbar} from './MassiveSnack'
import Page from './Page'
import Settings from './settings'
import Switch from './Switch'
import {useSettings} from './use-settings'

export default function SettingsPage() {
  const [battery, setBattery] = useState(false)
  const [ignoring, setIgnoring] = useState(false)
  const [term, setTerm] = useState('')
  const {settings, setSettings} = useSettings()
  const {toast} = useSnackbar()

  useEffect(() => {
    console.log(`${SettingsPage.name}.useEffect:`, {settings})
  }, [settings])

  useFocusEffect(
    useCallback(() => {
      NativeModules.AlarmModule.ignoringBattery(setIgnoring)
    }, []),
  )

  const update = useCallback(
    (value: boolean, field: keyof Settings) => {
      settingsRepo.update({}, {[field]: value})
      setSettings({...settings, [field]: value})
    },
    [settings, setSettings],
  )

  const changeAlarmEnabled = useCallback(
    (enabled: boolean) => {
      if (enabled) toast('Timers will now run after each set.', 4000)
      else toast('Stopped timers running after each set.', 4000)
      if (enabled && !ignoring) setBattery(true)
      update(enabled, 'alarm')
    },
    [setBattery, ignoring, toast, update],
  )

  const changeVibrate = useCallback(
    (enabled: boolean) => {
      if (enabled) toast('When a timer completes, vibrate your phone.', 4000)
      else toast('Stop vibrating at the end of timers.', 4000)
      update(enabled, 'vibrate')
    },
    [toast, update],
  )

  const changeSound = useCallback(async () => {
    const {fileCopyUri} = await DocumentPicker.pickSingle({
      type: 'audio/*',
      copyTo: 'documentDirectory',
    })
    if (!fileCopyUri) return
    settingsRepo.update({}, {sound: fileCopyUri})
    setSettings({...settings, sound: fileCopyUri})
    toast('This song will now play after rest timers complete.', 4000)
  }, [toast, setSettings, settings])

  const changeNotify = useCallback(
    (enabled: boolean) => {
      update(enabled, 'notify')
      if (enabled) toast('Show when a set is a new record.', 4000)
      else toast('Stopped showing notifications for new records.', 4000)
    },
    [toast, update],
  )

  const changeImages = useCallback(
    (enabled: boolean) => {
      update(enabled, 'images')
      if (enabled) toast('Show images for sets.', 4000)
      else toast('Stopped showing images for sets.', 4000)
    },
    [toast, update],
  )

  const changeUnit = useCallback(
    (enabled: boolean) => {
      update(enabled, 'showUnit')
      if (enabled) toast('Show option to select unit for sets.', 4000)
      else toast('Hid unit option for sets.', 4000)
    },
    [toast, update],
  )

  const changeSteps = useCallback(
    (enabled: boolean) => {
      update(enabled, 'steps')
      if (enabled) toast('Show steps for a workout.', 4000)
      else toast('Stopped showing steps for workouts.', 4000)
    },
    [toast, update],
  )

  const changeShowDate = useCallback(
    (enabled: boolean) => {
      update(enabled, 'showDate')
      if (enabled) toast('Show date for sets by default.', 4000)
      else toast('Stopped showing date for sets by default.', 4000)
    },
    [toast, update],
  )

  const changeShowSets = useCallback(
    (enabled: boolean) => {
      update(enabled, 'showSets')
      if (enabled) toast('Show target sets for workouts.', 4000)
      else toast('Stopped showing target sets for workouts.', 4000)
    },
    [toast, update],
  )

  const changeNoSound = useCallback(
    (enabled: boolean) => {
      update(enabled, 'noSound')
      if (enabled) toast('Disable sound on rest timer alarms.', 4000)
      else toast('Enabled sound for rest timer alarms.', 4000)
    },
    [toast, update],
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
    {name: 'Show sets', value: settings.showSets, onChange: changeShowSets},
  ]

  const changeTheme = useCallback(
    (value: string) => {
      settingsRepo.update({}, {theme: value})
      setSettings({...settings, theme: value})
    },
    [settings, setSettings],
  )

  const changeDate = useCallback(
    (value: string) => {
      settingsRepo.update({}, {date: value})
      setSettings({...settings, date: value as any})
    },
    [settings, setSettings],
  )

  const sound = useMemo(() => {
    if (!settings.sound) return null
    const split = settings.sound.split('/')
    return split.pop()
  }, [settings.sound])

  const theme = useMemo(() => {
    if (!'theme'.includes(term.toLowerCase())) return null
    return (
      <Picker
        style={{color: settings.color}}
        dropdownIconColor={settings.color}
        selectedValue={settings.theme}
        onValueChange={changeTheme}>
        <Picker.Item value="system" label="Follow system theme" />
        <Picker.Item value="dark" label="Dark theme" />
        <Picker.Item value="light" label="Light theme" />
      </Picker>
    )
  }, [term, settings.color, changeTheme, settings.theme])

  const changeColor = useCallback((value: string) => {
    setSettings({...settings, color: value})
    settingsRepo.update({}, {color: value})
  }, [])

  return (
    <>
      <DrawerHeader name="Settings" />
      <Page term={term} search={setTerm}>
        <ScrollView style={{marginTop: MARGIN}}>
          {switches
            .filter(input =>
              input.name.toLowerCase().includes(term.toLowerCase()),
            )
            .map(input => (
              <Switch
                onPress={() => input.onChange(!input.value)}
                key={input.name}
                value={input.value}
                onValueChange={input.onChange}>
                {input.name}
              </Switch>
            ))}
          {theme}
          {'color'.includes(term.toLowerCase()) && (
            <Picker
              style={{color: settings.color, marginTop: -10}}
              dropdownIconColor={settings.color}
              selectedValue={settings.color}
              onValueChange={changeColor}>
              {lightColors.concat(darkColors).map(colorOption => (
                <Picker.Item
                  key={colorOption.hex}
                  value={colorOption.hex}
                  label="Primary color"
                  color={colorOption.hex}
                />
              ))}
            </Picker>
          )}
          {'date format'.includes(term.toLowerCase()) && (
            <Picker
              style={{color: settings.color, marginTop: -10}}
              dropdownIconColor={settings.color}
              selectedValue={settings.date}
              onValueChange={changeDate}>
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
            </Picker>
          )}
          {'alarm sound'.includes(term.toLowerCase()) && (
            <Button style={{alignSelf: 'flex-start'}} onPress={changeSound}>
              Alarm sound: {sound}
            </Button>
          )}
        </ScrollView>
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
