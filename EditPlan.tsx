import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, IconButton} from 'react-native-paper';
import {DrawerParamList} from './App';
import {MARGIN, PADDING} from './constants';
import MassiveSwitch from './MassiveSwitch';
import {addPlan, updatePlan} from './plan.service';
import {PlanPageParams} from './PlanPage';
import {getNames} from './set.service';
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

  useFocusEffect(
    useCallback(() => {
      console.log(`${EditPlan.name}.focus:`, {plan});
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        headerRight: () => null,
        title: plan.id ? 'Edit plan' : 'Create plan',
      });
    }, [navigation, plan]),
  );

  useEffect(() => {
    getNames().then(n => {
      console.log(EditPlan.name, {n});
      setNames(n);
    });
  }, []);

  const save = useCallback(async () => {
    console.log(`${EditPlan.name}.save`, {days, workouts, plan});
    if (!days || !workouts) return;
    const newWorkouts = workouts.filter(workout => workout).join(',');
    const newDays = days.filter(day => day).join(',');
    if (typeof plan.id === 'undefined')
      await addPlan({days: newDays, workouts: newWorkouts});
    else
      await updatePlan({
        days: newDays,
        workouts: newWorkouts,
        id: plan.id,
      });
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
    <View style={{padding: PADDING}}>
      <ScrollView style={{height: '90%'}}>
        <Text style={styles.title}>Days</Text>
        {DAYS.map(day => (
          <View key={day} style={[styles.row, {alignItems: 'center'}]}>
            <MassiveSwitch
              value={days.includes(day)}
              onValueChange={value => toggleDay(value, day)}
            />
            <Text onPress={() => toggleDay(!days.includes(day), day)}>
              {day}
            </Text>
          </View>
        ))}
        <Text style={[styles.title, {marginTop: MARGIN}]}>Workouts</Text>
        {names.length === 0 && (
          <View>
            <Text>No workouts found.</Text>
          </View>
        )}
        {names.map(name => (
          <View key={name} style={[styles.row, {alignItems: 'center'}]}>
            <MassiveSwitch
              value={workouts.includes(name)}
              onValueChange={value => toggleWorkout(value, name)}
            />
            <Text onPress={() => toggleWorkout(!workouts.includes(name), name)}>
              {name}
            </Text>
          </View>
        ))}
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
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    marginBottom: MARGIN,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
