import {RouteProp, useFocusEffect, useRoute} from '@react-navigation/native'
import {useCallback, useMemo, useRef, useState} from 'react'
import {NativeModules, TextInput, View} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'
import {Button, ProgressBar} from 'react-native-paper'
import {getBestSet} from './best.service'
import {PADDING} from './constants'
import CountMany from './count-many'
import {AppDataSource} from './data-source'
import {getNow, setRepo, settingsRepo} from './db'
import GymSet, {defaultSet} from './gym-set'
import MassiveInput from './MassiveInput'
import {PlanPageParams} from './plan-page-params'
import Settings from './settings'
import StackHeader from './StackHeader'
import StartPlanItem from './StartPlanItem'
import {toast} from './toast'

export default function StartPlan() {
  const {params} = useRoute<RouteProp<PlanPageParams, 'StartPlan'>>()
  const [reps, setReps] = useState(params.first?.reps.toString() || '0')
  const [weight, setWeight] = useState(params.first?.weight.toString() || '0')
  const [unit, setUnit] = useState<string>(params.first?.unit || 'kg')
  const [best, setBest] = useState<GymSet>(params.first || defaultSet)
  const [selected, setSelected] = useState(0)
  const [settings, setSettings] = useState<Settings>()
  const [counts, setCounts] = useState<CountMany[]>()
  const weightRef = useRef<TextInput>(null)
  const repsRef = useRef<TextInput>(null)
  const unitRef = useRef<TextInput>(null)
  const workouts = useMemo(() => params.plan.workouts.split(','), [params])

  const [selection, setSelection] = useState({
    start: 0,
    end: 0,
  })

  const refresh = useCallback(async () => {
    const questions = workouts
      .map((workout, index) => `('${workout}',${index})`)
      .join(',')
    console.log({questions, workouts})
    const select = `
      SELECT workouts.name, COUNT(sets.id) as total, sets.sets
      FROM (select 0 as name, 0 as sequence union values ${questions}) as workouts 
      LEFT JOIN sets ON sets.name = workouts.name 
        AND sets.created LIKE STRFTIME('%Y-%m-%d%%', 'now', 'localtime')
        AND NOT sets.hidden
      GROUP BY workouts.name
      ORDER BY workouts.sequence
      LIMIT -1
      OFFSET 1
    `
    const newCounts = await AppDataSource.manager.query(select)
    console.log(`${StartPlan.name}.focus:`, {newCounts})
    setCounts(newCounts)
  }, [workouts])

  const select = useCallback(
    async (index: number, newCounts?: CountMany[]) => {
      setSelected(index)
      console.log(`${StartPlan.name}.next:`, {best, index})
      if (!counts && !newCounts) return
      const workout = counts ? counts[index] : newCounts[index]
      console.log(`${StartPlan.name}.next:`, {workout})
      const newBest = await getBestSet(workout.name)
      if (!newBest)
        return setBest({
          ...best,
          name: workout.name,
        })
      delete newBest.id
      console.log(`${StartPlan.name}.next:`, {newBest})
      setReps(newBest.reps.toString())
      setWeight(newBest.weight.toString())
      setUnit(newBest.unit)
      setBest(newBest)
    },
    [counts, best],
  )

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({where: {}}).then(setSettings)
      refresh()
    }, [refresh]),
  )

  const handleSubmit = async () => {
    const [{now}] = await getNow()
    const newSet: GymSet = {
      ...best,
      weight: +weight,
      reps: +reps,
      unit,
      created: now,
      hidden: false,
    }
    await setRepo.save(newSet)
    await refresh()
    if (
      settings.notify &&
      (+weight > best.weight || (+reps > best.reps && +weight === best.weight))
    )
      toast("Great work King! That's a new record.")
    if (!settings.alarm) return
    const milliseconds =
      Number(best.minutes) * 60 * 1000 + Number(best.seconds) * 1000
    const {vibrate, sound, noSound} = settings
    const args = [milliseconds, vibrate, sound, noSound]
    NativeModules.AlarmModule.timer(...args)
  }

  const handleUnit = useCallback((value: string) => {
    setUnit(value.replace(/,|'/g, ''))
    if (value.match(/,|'/))
      toast('Commas and single quotes would break CSV exports')
  }, [])

  return (
    <>
      <StackHeader title={params.plan.days.replace(/,/g, ', ')} />
      <View style={{padding: PADDING, flex: 1, flexDirection: 'column'}}>
        <View style={{flex: 1}}>
          <MassiveInput
            label="Reps"
            keyboardType="numeric"
            value={reps}
            onChangeText={setReps}
            onSubmitEditing={() => weightRef.current?.focus()}
            selection={selection}
            onSelectionChange={e => setSelection(e.nativeEvent.selection)}
            innerRef={repsRef}
          />
          <MassiveInput
            label="Weight"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            onSubmitEditing={handleSubmit}
            innerRef={weightRef}
            blurOnSubmit
          />
          {settings?.showUnit && (
            <MassiveInput
              autoCapitalize="none"
              label="Unit"
              value={unit}
              onChangeText={handleUnit}
              innerRef={unitRef}
            />
          )}
          {counts && (
            <FlatList
              data={counts}
              renderItem={props => (
                <View>
                  <StartPlanItem
                    {...props}
                    onUndo={refresh}
                    onSelect={select}
                    selected={selected}
                  />
                  <ProgressBar
                    progress={(props.item.total || 0) / (props.item.sets || 3)}
                  />
                </View>
              )}
            />
          )}
        </View>
        <Button mode="contained" icon="save" onPress={handleSubmit}>
          Save
        </Button>
      </View>
    </>
  )
}
