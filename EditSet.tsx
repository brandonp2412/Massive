import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {NativeModules, ScrollView, StyleSheet, View} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Button, IconButton, TextInput} from 'react-native-paper';
import {DatabaseContext} from './App';
import {HomePageParams} from './HomePage';
import {Plan} from './plan';
import Set from './set';
import {DAYS, format} from './time';

export default function EditSet() {
  const {params} = useRoute<RouteProp<HomePageParams, 'EditSet'>>();
  const [name, setName] = useState(params.set.name);
  const [reps, setReps] = useState(params.set.reps.toString());
  const [weight, setWeight] = useState(params.set.weight.toString());
  const [created, setCreated] = useState(new Date(params.set.created));
  const [unit, setUnit] = useState(params.set.unit);
  const [showDate, setShowDate] = useState(false);
  const weightRef = useRef<any>(null);
  const db = useContext(DatabaseContext);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        title: 'Set',
      });
    }, [navigation]),
  );

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

  const getBest = useCallback(
    async (query: string): Promise<Set> => {
      const bestWeight = `
      SELECT name, reps, unit, MAX(weight) AS weight 
      FROM sets
      WHERE name = ?
      GROUP BY name;
    `;
      const bestReps = `
      SELECT name, MAX(reps) as reps, unit, weight 
      FROM sets
      WHERE name = ?
        AND weight = ?
      GROUP BY name;
    `;
      const [weightResult] = await db.executeSql(bestWeight, [query]);
      if (!weightResult.rows.length)
        return {
          weight: 0,
          name: '',
          reps: 0,
          created: new Date().toISOString(),
          id: 0,
        };
      const [repsResult] = await db.executeSql(bestReps, [
        query,
        weightResult.rows.item(0).weight,
      ]);
      return repsResult.rows.item(0);
    },
    [db],
  );

  const predict = useCallback(async () => {
    if ((await AsyncStorage.getItem('predictiveSets')) === 'false') return;
    const todaysPlan = await getTodaysPlan();
    if (todaysPlan.length === 0) return;
    const todaysSets = await getTodaysSets();
    const todaysWorkouts = todaysPlan[0].workouts.split(',');
    let nextWorkout = todaysWorkouts[0];
    if (todaysSets.length > 0) {
      const count = todaysSets.filter(
        set => set.name === todaysSets[0].name,
      ).length;
      const maxSets = await AsyncStorage.getItem('maxSets');
      nextWorkout = todaysSets[0].name;
      if (count >= Number(maxSets))
        nextWorkout =
          todaysWorkouts[todaysWorkouts.indexOf(todaysSets[0].name!) + 1];
    }
    const best = await getBest(nextWorkout);
    setName(best.name);
    setReps(best.reps.toString());
    setWeight(best.weight.toString());
    setUnit(best.unit);
  }, [getTodaysSets, getTodaysPlan, getBest]);

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
    <View style={{padding: 10}}>
      <ScrollView style={{height: '90%'}}>
        <TextInput
          style={styles.marginBottom}
          label="Name"
          value={name}
          onChangeText={setName}
          autoCorrect={false}
        />
        <TextInput
          style={styles.marginBottom}
          label="Reps"
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
          autoFocus
          blurOnSubmit={false}
          onSubmitEditing={() => weightRef.current?.focus()}
        />
        <TextInput
          style={styles.marginBottom}
          label="Weight"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          onSubmitEditing={save}
          ref={weightRef}
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
      </ScrollView>
      <Button mode="contained" icon="save" onPress={save}>
        Save
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: 10,
  },
});
