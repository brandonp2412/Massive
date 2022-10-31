import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {MARGIN, PADDING} from './constants';
import {planRepo, setRepo} from './db';
import {DrawerParamList} from './drawer-param-list';
import {PlanPageParams} from './plan-page-params';
import StackHeader from './StackHeader';
import Switch from './Switch';
import {DAYS} from './time';

export default function EditPlan() {
  const {params} = useRoute<RouteProp<PlanPageParams, 'EditPlan'>>();
  const {plan} = params;
  const [days, setDays] = useState<string[]>(
    plan.days ? plan.days.split(',') : [],
  );
  const [workouts, setWorkouts] = useState<string[]>(
    plan.workouts ? plan.workouts.split(',') : [],
  );
  const [names, setNames] = useState<string[]>([]);
  const navigation = useNavigation<NavigationProp<DrawerParamList>>();

  useEffect(() => {
    setRepo
      .createQueryBuilder()
      .select('name')
      .distinct(true)
      .getRawMany()
      .then(values => {
        console.log(EditPlan.name, {values});
        setNames(values.map(value => value.name));
      });
  }, []);

  const save = useCallback(async () => {
    console.log(`${EditPlan.name}.save`, {days, workouts, plan});
    if (!days || !workouts) return;
    const newWorkouts = workouts.filter(workout => workout).join(',');
    const newDays = days.filter(day => day).join(',');
    await planRepo.save({days: newDays, workouts: newWorkouts, id: plan.id});
    navigation.goBack();
  }, [days, workouts, plan, navigation]);

  const toggleWorkout = useCallback(
    (on: boolean, name: string) => {
      if (on) {
        setWorkouts([...workouts, name]);
      } else {
        setWorkouts(workouts.filter(workout => workout !== name));
      }
    },
    [setWorkouts, workouts],
  );

  const toggleDay = useCallback(
    (on: boolean, day: string) => {
      if (on) {
        setDays([...days, day]);
      } else {
        setDays(days.filter(d => d !== day));
      }
    },
    [setDays, days],
  );

  return (
    <>
      <StackHeader title="Edit plan" />
      <View style={{padding: PADDING, flex: 1}}>
        <ScrollView style={{flex: 1}}>
          <Text style={styles.title}>Days</Text>
          {DAYS.map(day => (
            <Switch
              key={day}
              onValueChange={value => toggleDay(value, day)}
              onPress={() => toggleDay(!days.includes(day), day)}
              value={days.includes(day)}>
              {day}
            </Switch>
          ))}
          <Text style={[styles.title, {marginTop: MARGIN}]}>Workouts</Text>
          {names.length === 0 ? (
            <View>
              <Text>No workouts found.</Text>
            </View>
          ) : (
            names.map(name => (
              <Switch
                key={name}
                onValueChange={value => toggleWorkout(value, name)}
                value={workouts.includes(name)}
                onPress={() => toggleWorkout(!workouts.includes(name), name)}>
                {name}
              </Switch>
            ))
          )}
        </ScrollView>
        {names.length === 0 ? (
          <Button
            disabled={workouts.length === 0 && days.length === 0}
            mode="contained"
            onPress={() => {
              navigation.goBack();
              navigation.navigate('Workouts', {
                screen: 'EditWorkout',
                params: {value: {name: ''}},
              });
            }}>
            Add workout
          </Button>
        ) : (
          <Button
            disabled={workouts.length === 0 && days.length === 0}
            style={{marginTop: MARGIN}}
            mode="contained"
            icon="save"
            onPress={save}>
            Save
          </Button>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    marginBottom: MARGIN,
  },
});
