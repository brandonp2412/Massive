import AsyncStorage from '@react-native-async-storage/async-storage';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {NativeModules, ScrollView, StyleSheet} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Button, TextInput} from 'react-native-paper';
import {DatabaseContext} from './App';
import {StackParams} from './HomePage';
import {Plan} from './plan';
import Set from './set';
import {DAYS, format} from './time';

export default function EditSet() {
  const {params} = useRoute<RouteProp<StackParams, 'EditSet'>>();
  const [name, setName] = useState(params.set.name);
  const [reps, setReps] = useState(params.set.reps.toString());
  const [weight, setWeight] = useState(params.set.weight.toString());
  const [created, setCreated] = useState(new Date(params.set.created));
  const [unit, setUnit] = useState(params.set.unit);
  const [showDate, setShowDate] = useState(false);
  const db = useContext(DatabaseContext);
  const navigation = useNavigation();

  const getTodaysPlan = useCallback(async (): Promise<Plan[]> => {
    const today = DAYS[new Date().getDay()];
    const [result] = await db.executeSql(
      `SELECT * FROM plans WHERE days LIKE ? LIMIT 1`,
      [`%${today}%`],
    );
    return result.rows.raw();
  }, [db]);

  const getTodaysSets = useCallback(async (): Promise<Set[]> => {
    const today = new Date().toISOString().split('T')[0];
    const [result] = await db.executeSql(
      `SELECT * FROM sets WHERE created LIKE ? ORDER BY created DESC`,
      [`${today}%`],
    );
    return result.rows.raw();
  }, [db]);

  const predict = useCallback(async () => {
    if ((await AsyncStorage.getItem('predictiveSets')) === 'false') return;
    const todaysPlan = await getTodaysPlan();
    if (todaysPlan.length === 0) return;
    const todaysSets = await getTodaysSets();
    const todaysWorkouts = todaysPlan[0].workouts.split(',');
    if (todaysSets.length === 0) return setName(todaysWorkouts[0]);
    const count = todaysSets.filter(
      set => set.name === todaysSets[0].name,
    ).length;
    const maxSets = await AsyncStorage.getItem('maxSets');
    if (count < Number(maxSets)) {
      setName(todaysSets[0].name);
      setReps(todaysSets[0].reps.toString());
      setWeight(todaysSets[0].weight.toString());
      return setUnit(todaysSets[0].unit);
    }
    const nextWorkout =
      todaysWorkouts[todaysWorkouts.indexOf(todaysSets[0].name!) + 1];
    if (!nextWorkout) return;
    setName(nextWorkout);
  }, [getTodaysSets, getTodaysPlan]);

  useEffect(() => {
    if (params.set.id) return;
    predict();
  }, [predict, params.set.id]);

  const onConfirm = (date: Date) => {
    setCreated(date);
    setShowDate(false);
  };

  const update = useCallback(async () => {
    console.log(`${EditSet.name}.update`, params.set);
    await db.executeSql(
      `UPDATE sets SET name = ?, reps = ?, weight = ?, created = ?, unit = ? WHERE id = ?`,
      [name, reps, weight, created.toISOString(), unit, params.set.id],
    );
    navigation.goBack();
  }, [params.set, name, reps, weight, created, unit, db, navigation]);

  const notify = useCallback(async () => {
    const enabled = await AsyncStorage.getItem('alarmEnabled');
    if (enabled !== 'true') return;
    const minutes = await AsyncStorage.getItem('minutes');
    const seconds = await AsyncStorage.getItem('seconds');
    const milliseconds = Number(minutes) * 60 * 1000 + Number(seconds) * 1000;
    NativeModules.AlarmModule.timer(milliseconds);
  }, []);

  const add = useCallback(async () => {
    if (name === undefined || reps === '' || weight === '') return;
    const insert = `
      INSERT INTO sets(name, reps, weight, created, unit) 
      VALUES (?,?,?,?,?)
    `;
    await db.executeSql(insert, [
      name,
      reps,
      weight,
      created.toISOString(),
      unit || 'kg',
    ]);
    notify();
    navigation.goBack();
  }, [name, reps, weight, created, unit, db, navigation, notify]);

  const save = useCallback(async () => {
    if (params.set.id) return update();
    return add();
  }, [update, add, params.set.id]);

  return (
    <ScrollView style={{padding: 10}}>
      <TextInput
        style={styles.marginBottom}
        autoFocus
        label="Name *"
        value={name}
        onChangeText={setName}
        autoCorrect={false}
      />
      <TextInput
        style={styles.marginBottom}
        label="Reps *"
        keyboardType="numeric"
        value={reps}
        onChangeText={setReps}
      />
      <TextInput
        style={styles.marginBottom}
        label="Weight *"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        onSubmitEditing={save}
      />
      <TextInput
        style={styles.marginBottom}
        label="Unit (kg)"
        value={unit}
        onChangeText={setUnit}
        onSubmitEditing={save}
      />

      <Button
        style={styles.marginBottom}
        icon="calendar-outline"
        onPress={() => setShowDate(true)}>
        {format(created)}
      </Button>
      <DateTimePickerModal
        isVisible={showDate}
        mode="datetime"
        onConfirm={onConfirm}
        onCancel={() => setShowDate(false)}
        date={created}
      />
      <Button mode="contained" icon="save" onPress={save}>
        Save
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: 10,
  },
});
