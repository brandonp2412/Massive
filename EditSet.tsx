import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import {useCallback, useState} from 'react'
import {NativeModules, View} from 'react-native'
import {PADDING} from './constants'
import {setRepo, settingsRepo} from './db'
import GymSet from './gym-set'
import {HomePageParams} from './home-page-params'
import SetForm from './SetForm'
import Settings from './settings'
import StackHeader from './StackHeader'
import {toast} from './toast'

export default function EditSet() {
  const {params} = useRoute<RouteProp<HomePageParams, 'EditSet'>>()
  const {set} = params
  const navigation = useNavigation()
  const [settings, setSettings] = useState<Settings>()

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({where: {}}).then(setSettings)
    }, []),
  )

  const startTimer = useCallback(
    async (name: string) => {
      if (!settings.alarm) return
      const first = await setRepo.findOne({where: {name}})
      const milliseconds =
        (first?.minutes ?? 3) * 60 * 1000 + (first?.seconds ?? 0) * 1000
      NativeModules.AlarmModule.timer(
        milliseconds,
        settings.vibrate,
        settings.sound,
        settings.noSound,
      )
    },
    [settings],
  )

  const added = useCallback(
    async (value: GymSet) => {
      startTimer(value.name)
      console.log(`${EditSet.name}.add`, {set: value})
      if (!settings.notify) return
      if (
        value.weight > set.weight ||
        (value.reps > set.reps && value.weight === set.weight)
      )
        toast("Great work King! That's a new record.")
    },
    [startTimer, set, settings],
  )

  const saved = useCallback(
    async (value: GymSet) => {
      if (typeof set.id !== 'number') added(value)
      navigation.goBack()
    },
    [added, set.id, navigation],
  )

  return (
    <>
      <StackHeader title="Edit set" />
      <View style={{padding: PADDING, flex: 1}}>
        {settings && <SetForm settings={settings} onSaved={saved} set={set} />}
      </View>
    </>
  )
}
