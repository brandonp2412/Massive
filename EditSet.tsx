import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {useCallback} from 'react'
import {NativeModules, View} from 'react-native'
import {PADDING} from './constants'
import {getNow, setRepo} from './db'
import GymSet from './gym-set'
import {HomePageParams} from './home-page-params'
import {useSnackbar} from './MassiveSnack'
import SetForm from './SetForm'
import StackHeader from './StackHeader'
import {useSettings} from './use-settings'

export default function EditSet() {
  const {params} = useRoute<RouteProp<HomePageParams, 'EditSet'>>()
  const {set} = params
  const navigation = useNavigation()
  const {toast} = useSnackbar()
  const {settings} = useSettings()

  const startTimer = useCallback(
    async (name: string) => {
      if (!settings.alarm) return
      const {minutes, seconds} = await setRepo.findOne({where: {name}})
      const milliseconds = (minutes ?? 3) * 60 * 1000 + (seconds ?? 0) * 1000
      NativeModules.AlarmModule.timer(
        milliseconds,
        !!settings.vibrate,
        settings.sound,
        !!settings.noSound,
      )
    },
    [settings],
  )

  const add = useCallback(
    async (value: GymSet) => {
      startTimer(value.name)
      const [{now}] = await getNow()
      value.created = now
      value.hidden = false
      console.log(`${EditSet.name}.add`, {set: value})
      const result = await setRepo.save(value)
      console.log({result})
      if (!settings.notify) return
      if (
        value.weight > set.weight ||
        (value.reps > set.reps && value.weight === set.weight)
      )
        toast("Great work King! That's a new record.", 3000)
    },
    [startTimer, set, toast, settings],
  )

  const save = useCallback(
    async (value: GymSet) => {
      if (typeof set.id === 'number') await setRepo.save(value)
      else await add(value)
      navigation.goBack()
    },
    [add, set.id, navigation],
  )

  return (
    <>
      <StackHeader title="Edit set" />
      <View style={{padding: PADDING, flex: 1}}>
        <SetForm save={save} set={set} />
      </View>
    </>
  )
}
