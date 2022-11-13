import {RouteProp, useRoute} from '@react-navigation/native'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {NativeModules, TextInput, View} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'
import {Button, ProgressBar} from 'react-native-paper'
import {getBestSet} from './best.service'
import {MARGIN, PADDING} from './constants'
import CountMany from './count-many'
import {AppDataSource} from './data-source'
import {getNow, setRepo, settingsRepo} from './db'
import GymSet from './gym-set'
import MassiveInput from './MassiveInput'
import {PlanPageParams} from './plan-page-params'
import SetForm from './SetForm'
import Settings from './settings'
import StackHeader from './StackHeader'
import StartPlanItem from './StartPlanItem'
import {toast} from './toast'

export default function StartPlan() {
  const {params} = useRoute<RouteProp<PlanPageParams, 'StartPlan'>>()
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState<string>('kg')
  const [best, setBest] = useState<GymSet>()
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
    return newCounts
  }, [workouts])

  const select = useCallback(
    async (index: number, newCounts?: CountMany[]) => {
      setSelected(index)
      console.log(`${StartPlan.name}.next:`, {best, index})
      if (!counts && !newCounts) return
      const workout = counts ? counts[index] : newCounts[index]
      console.log(`${StartPlan.name}.next:`, {workout})
      const newBest = await getBestSet(workout.name)
      delete newBest.id
      console.log(`${StartPlan.name}.next:`, {newBest})
      setReps(newBest.reps.toString())
      setWeight(newBest.weight.toString())
      setUnit(newBest.unit)
      setBest(newBest)
    },
    [counts, best],
  )

  useEffect(() => {
    refresh().then(newCounts => select(0, newCounts))
    settingsRepo.findOne({where: {}}).then(setSettings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  const handleSubmit = async () => {
    console.log(`${SetForm.name}.handleSubmit:`, {reps, weight, unit, best})
    const [{now}] = await getNow()
    await setRepo.save({
      ...best,
      weight: +weight,
      reps: +reps,
      unit,
      created: now,
      hidden: false,
    })
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

  const progress = useMemo(() => {
    if (!counts || !counts[selected].sets) return
    return counts[selected].total / (counts[selected].sets ?? 1)
  }, [counts, selected])

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
                <StartPlanItem
                  {...props}
                  onUndo={refresh}
                  onSelect={select}
                  selected={selected}
                />
              )}
            />
          )}
        </View>
        {progress && (
          <ProgressBar progress={progress} style={{marginBottom: MARGIN}} />
        )}
        <Button mode="contained" icon="save" onPress={handleSubmit}>
          Save
        </Button>
      </View>
    </>
  )
}
