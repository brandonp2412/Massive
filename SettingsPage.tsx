import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import {format} from 'date-fns'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {NativeModules, Platform, View} from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import {Dirs, FileSystem} from 'react-native-file-access'
import {Button, Subheading} from 'react-native-paper'
import ConfirmDialog from './ConfirmDialog'
import {ITEM_PADDING, MARGIN, toSentenceCase} from './constants'
import {AppDataSource} from './data-source'
import {setRepo, settingsRepo} from './db'
import {DrawerParamList} from './drawer-param-list'
import DrawerHeader from './DrawerHeader'
import LabelledButton from './LabelledButton'
import {darkOptions, lightOptions, themeOptions} from './options'
import Page from './Page'
import Select from './Select'
import Settings from './settings'
import Switch from './Switch'
import {toast} from './toast'
import {useTheme} from './use-theme'

const defaultFormats = ['P', 'Pp', 'ccc p', 'p']

export default function SettingsPage() {
  const {control, watch} = useForm<Settings>({
    defaultValues: async () => settingsRepo.findOne({where: {}}),
  })
  const settings = watch()
  const [term, setTerm] = useState('')
  const [sound, setSound] = useState('')
  const {setTheme, setLightColor, setDarkColor} = useTheme()
  const [formatOptions, setFormatOptions] = useState<string[]>(defaultFormats)
  const [importing, setImporting] = useState(false)
  const [ignoring, setIgnoring] = useState(false)
  const {reset} = useNavigation<NavigationProp<DrawerParamList>>()

  useEffect(() => {
    if (Object.keys(settings).length === 0) return
    console.log(`${SettingsPage.name}.update`, {settings})
    settingsRepo.update({}, settings)
    setLightColor(settings.lightColor)
    setDarkColor(settings.darkColor)
    setTheme(settings.theme)
    if (!settings.alarm || ignoring) return
    NativeModules.SettingsModule.ignoreBattery()
    setIgnoring(true)
  }, [settings, setDarkColor, setLightColor, setTheme, ignoring])

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return
      NativeModules.SettingsModule.ignoringBattery(setIgnoring)
      NativeModules.SettingsModule.is24().then((is24: boolean) => {
        console.log(`${SettingsPage.name}.focus:`, {is24})
        if (is24) setFormatOptions(['P', 'P, k:m', 'ccc k:m', 'k:m'])
        else setFormatOptions(defaultFormats)
      })
    }, []),
  )

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

  const soundString = useMemo(() => {
    if (!sound) return null
    const split = sound.split('/')
    return split.pop()
  }, [sound])

  const renderSwitch = useCallback(
    (key: keyof Settings) => (
      <Switch control={control} name={key}>
        {toSentenceCase(key)}
      </Switch>
    ),
    [control],
  )

  const switches: (keyof Settings)[] = [
    'alarm',
    'vibrate',
    'noSound',
    'notify',
    'images',
    'showUnit',
    'steps',
    'showDate',
  ]

  const selects: (keyof Settings)[] = [
    'theme',
    'darkColor',
    'lightColor',
    'date',
  ]

  const getItems = useCallback(
    (key: keyof Settings) => {
      const today = new Date()
      switch (key) {
        case 'theme':
          return themeOptions
        case 'darkColor':
          return lightOptions
        case 'lightColor':
          return darkOptions
        case 'date':
          return formatOptions.map(option => ({
            label: format(today, option),
            value: option,
          }))
        default:
          return []
      }
    },
    [formatOptions],
  )

  const renderSelect = useCallback(
    (key: keyof Settings) => (
      <Controller
        key={key}
        name={key}
        control={control}
        render={({field: {onChange, value}}) => (
          <Select
            value={value as string}
            onChange={onChange}
            items={getItems(key)}
            label={toSentenceCase(key)}
          />
        )}
      />
    ),
    [control, getItems],
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

  const buttons = [
    {
      name: 'Alarm sound',
      element: (
        <LabelledButton label="Alarm sound" onPress={changeSound}>
          {soundString || 'Default'}
        </LabelledButton>
      ),
    },
    {
      name: 'Export database',
      element: (
        <Button style={{alignSelf: 'flex-start'}} onPress={exportDatabase}>
          Export database
        </Button>
      ),
    },
    {
      name: 'Import database',
      element: (
        <Button
          style={{alignSelf: 'flex-start'}}
          onPress={() => setImporting(true)}>
          Import database
        </Button>
      ),
    },
  ]

  return (
    <>
      <DrawerHeader name="Settings" />

      <Page term={term} search={setTerm} style={{flexGrow: 0}}>
        <View style={{marginTop: MARGIN}}>
          {switches
            .filter(s => s.toLowerCase().includes(term.toLowerCase()))
            .map(s => renderSwitch(s))}
          {selects
            .filter(s => s.toLowerCase().includes(term.toLowerCase()))
            .map(key => renderSelect(key))}
          {buttons
            .filter(b => b.name.includes(term.toLowerCase()))
            .map(b => b.element)}
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
