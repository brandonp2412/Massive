import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Dialog, Portal, Switch} from 'react-native-paper';
import {DatabaseContext} from './App';
import {Plan} from './plan';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function EditPlan({
  plan,
  onSave,
  show,
  setShow,
}: {
  onSave: () => void;
  show: boolean;
  setShow: (visible: boolean) => void;
  plan?: Plan;
}) {
  const [days, setDays] = useState<string[]>([]);
  const [workouts, setWorkouts] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const db = useContext(DatabaseContext);

  const refresh = async () => {
    const [namesResult] = await db.executeSql('SELECT DISTINCT name FROM sets');
    if (!namesResult.rows.length) return setNames([]);
    setNames(namesResult.rows.raw().map(({name}) => name));
    if (!plan) return;
    setDays(plan.days.split(','));
    setWorkouts(plan.workouts.split(','));
  };

  useEffect(() => {
    refresh();
  }, [plan, show]);

  const save = async () => {
    if (!days || !workouts) return;
    const newWorkouts = workouts.filter(workout => workout).join(',');
    const newDays = days.filter(day => day).join(',');
    if (!plan)
      await db.executeSql(`INSERT INTO plans(days, workouts) VALUES (?, ?)`, [
        newDays,
        newWorkouts,
      ]);
    else
      await db.executeSql(
        `UPDATE plans SET days = ?, workouts = ? WHERE id = ?`,
        [newDays, newWorkouts, plan.id],
      );
    setShow(false);
    onSave();
  };

  const toggleWorkout = (on: boolean, name: string) => {
    if (on) {
      setWorkouts([...workouts, name]);
    } else {
      setWorkouts(workouts.filter(workout => workout !== name));
    }
  };

  const toggleDay = (on: boolean, day: string) => {
    if (on) {
      setDays([...days, day]);
    } else {
      setDays(days.filter(d => d !== day));
    }
  };

  return (
    <Portal>
      <Dialog visible={show} onDismiss={() => setShow(false)}>
        <Dialog.Title>
          {plan ? `Edit "${days.join(', ')}"` : 'Add a plan'}
        </Dialog.Title>
        <Dialog.Content style={[styles.row, {justifyContent: 'space-between'}]}>
          <View>
            <Text style={styles.title}>Days</Text>
            {DAYS.map(day => (
              <View key={day} style={[styles.row, {alignItems: 'center'}]}>
                <Switch
                  value={days.includes(day)}
                  style={{marginRight: 5}}
                  onValueChange={value => toggleDay(value, day)}
                />
                <Text onPress={() => toggleDay(!days.includes(day), day)}>
                  {day}
                </Text>
              </View>
            ))}
          </View>
          <View>
            <Text style={styles.title}>Workouts</Text>
            {names.map(name => (
              <View key={name} style={[styles.row, {alignItems: 'center'}]}>
                <Switch
                  value={workouts.includes(name)}
                  style={{marginRight: 5}}
                  onValueChange={value => toggleWorkout(value, name)}
                />
                <Text
                  onPress={() => toggleWorkout(!workouts.includes(name), name)}>
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button icon="close" onPress={() => setShow(false)}>
            Cancel
          </Button>
          <Button mode="contained" icon="save" onPress={save}>
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
  },
});
