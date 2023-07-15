import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Button, IconButton, Text } from 'react-native-paper'
import { getLast } from './best.service'
import { MARGIN, PADDING } from './constants'
import { planRepo, setRepo } from './db'
import { defaultSet } from './gym-set'
import { PlanPageParams } from './plan-page-params'
import StackHeader from './StackHeader'
import Switch from './Switch'
import { DAYS } from './time'

export default function EditPlan() {
  const { params } = useRoute<RouteProp<PlanPageParams, 'EditPlan'>>()
  const { plan } = params
  const [days, setDays] = useState<string[]>(
    plan.days ? plan.days.split(',') : [],
  )
  const [workouts, setWorkouts] = useState<string[]>(
    plan.workouts ? plan.workouts.split(',') : [],
  )
  const [names, setNames] = useState<string[]>([])
  const navigation = useNavigation<NavigationProp<PlanPageParams>>()

  useEffect(() => {
    setRepo
      .createQueryBuilder()
      .select('name')
      .distinct(true)
      .orderBy('name')
      .getRawMany()
      .then((values) => {
        console.log(EditPlan.name, { values })
        setNames(values.map((value) => value.name))
      })
  }, [])

  const save = useCallback(async () => {
    console.log(`${EditPlan.name}.save`, { days, workouts, plan })
    if (!days || !workouts) return
    const newWorkouts = workouts.filter((workout) => workout).join(',')
    const newDays = days.filter((day) => day).join(',')
    await planRepo.save({ days: newDays, workouts: newWorkouts, id: plan.id })
    navigation.goBack()
  }, [days, workouts, plan, navigation])

  const toggleWorkout = useCallback(
    (on: boolean, name: string) => {
      if (on) {
        setWorkouts([...workouts, name])
      } else {
        setWorkouts(workouts.filter((workout) => workout !== name))
      }
    },
    [setWorkouts, workouts],
  )

  const toggleDay = useCallback(
    (on: boolean, day: string) => {
      if (on) {
        setDays([...days, day])
      } else {
        setDays(days.filter((d) => d !== day))
      }
    },
    [setDays, days],
  )

  return (
    <>
      <StackHeader
        title={typeof plan.id === 'number' ? 'Edit plan' : 'Add plan'}
      >
        {typeof plan.id === 'number' && (
          <IconButton
            onPress={async () => {
              let first = await getLast(workouts[0])
              if (!first) first = { ...defaultSet, name: workouts[0] }
              delete first.id
              navigation.navigate('StartPlan', { plan: params.plan, first })
            }}
            icon='play-arrow'
          />
        )}
      </StackHeader>
      <View style={{ padding: PADDING, flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <Text style={styles.title}>Days</Text>
          {DAYS.map((day) => (
            <Switch
              key={day}
              onChange={(value) => toggleDay(value, day)}
              value={days.includes(day)}
              title={day}
            />
          ))}
          <Text style={[styles.title, { marginTop: MARGIN }]}>Workouts</Text>
          {names.length === 0
            ? (
              <View>
                <Text>No workouts found.</Text>
              </View>
            )
            : (
              names.map((name) => (
                <Switch
                  key={name}
                  onChange={(value) => toggleWorkout(value, name)}
                  value={workouts.includes(name)}
                  title={name}
                />
              ))
            )}
        </ScrollView>

        <Button
          disabled={workouts.length === 0 && days.length === 0}
          style={styles.button}
          mode='contained'
          icon='save'
          onPress={save}
        >
          Save
        </Button>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    marginBottom: MARGIN,
  },
  button: {},
})
