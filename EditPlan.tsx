import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, IconButton} from 'react-native-paper';
import {DatabaseContext} from './App';
import MassiveSwitch from './MassiveSwitch';
import {PlanPageParams} from './PlanPage';
import {DAYS} from './time';

export default function EditPlan() {
  const {params} = useRoute<RouteProp<PlanPageParams, 'EditPlan'>>();
  const [days, setDays] = useState<string[]>(params.plan.days.split(','));
  const [workouts, setWorkouts] = useState<string[]>(
    params.plan.workouts.split(','),
  );
  const [names, setNames] = useState<string[]>([]);
  const db = useContext(DatabaseContext);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        headerRight: () => null,
        title: 'Plan',
      });
    }, [navigation]),
  );

  useEffect(() => {
    const refresh = async () => {
      const [namesResult] = await db.executeSql(
        'SELECT DISTINCT name FROM sets',
      );
      if (!namesResult.rows.length) return setNames([]);
      setNames(namesResult.rows.raw().map(({name}) => name));
    };
    refresh();
  }, [db]);

  const save = useCallback(async () => {
    console.log(`${EditPlan.name}.save`, {days, workouts, params});
    if (!days || !workouts) return;
    const newWorkouts = workouts.filter(workout => workout).join(',');
    const newDays = days.filter(day => day).join(',');
    if (!params.plan.id)
      await db.executeSql(`INSERT INTO plans(days, workouts) VALUES (?, ?)`, [
        newDays,
        newWorkouts,
      ]);
    else
      await db.executeSql(
        `UPDATE plans SET days = ?, workouts = ? WHERE id = ?`,
        [newDays, newWorkouts, params.plan.id],
      );
    navigation.goBack();
  }, [days, workouts, db, params, navigation]);

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
    <View style={{padding: 10}}>
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
        <Text style={[styles.title, {marginTop: 10}]}>Workouts</Text>
        {names.length === 0 && (
          <Text style={{maxWidth: '80%'}}>
            No sets found. Try going to the home page and adding some workouts
            first.
          </Text>
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
      <Button
        style={{marginTop: 10}}
        mode="contained"
        icon="save"
        onPress={save}>
        Save
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
