import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Button, TextInput} from 'react-native-paper';
import {DatabaseContext} from './App';
import {Plan} from './plan';
import Set from './set';
import {DAYS, format} from './time';

export default function SetForm({
  save,
  set,
}: {
  set: Set;
  save: (set: Set) => void;
}) {
  const [name, setName] = useState(set.name);
  const [reps, setReps] = useState(set.reps.toString());
  const [weight, setWeight] = useState(set.weight.toString());
  const [created, setCreated] = useState(new Date(set.created));
  const [unit, setUnit] = useState(set.unit);
  const [showDate, setShowDate] = useState(false);
  const weightRef = useRef<any>(null);
  const repsRef = useRef<any>(null);
  const db = useContext(DatabaseContext);

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
        s => s.name === todaysSets[0].name,
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
    repsRef.current?.focus();
  }, [getTodaysSets, getTodaysPlan, getBest]);

  useEffect(() => {
    if (set.id || set.name) return;
    predict();
  }, [predict, set.id, set.name]);

  const onConfirm = (date: Date) => {
    setCreated(date);
    setShowDate(false);
  };

  const handleSubmit = () => {
    save({
      name,
      reps: Number(reps),
      created: created.toISOString(),
      weight: Number(weight),
      id: set.id,
      unit,
    });
  };

  const textInputs = (
    <>
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
        ref={repsRef}
        blurOnSubmit={false}
        onSubmitEditing={() => weightRef.current?.focus()}
      />
      <TextInput
        style={styles.marginBottom}
        label="Weight"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        onSubmitEditing={handleSubmit}
        ref={weightRef}
        selectTextOnFocus
      />
      <TextInput
        style={styles.marginBottom}
        label="Unit (kg)"
        value={unit}
        onChangeText={setUnit}
        onSubmitEditing={handleSubmit}
      />
    </>
  );

  return (
    <>
      <ScrollView style={{height: '90%'}}>
        {textInputs}
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
      <Button mode="contained" icon="save" onPress={handleSubmit}>
        Save
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: 10,
  },
});
