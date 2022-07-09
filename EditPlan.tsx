import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, Dialog, Portal, Switch} from 'react-native-paper';
import {DatabaseContext} from './App';
import {Plan} from './plan';
import {DAYS} from './time';

export default function EditPlan({
  plan,
  onSave,
  setPlan,
}: {
  onSave: () => void;
  plan?: Plan;
  setPlan: (plan?: Plan) => void;
}) {
  const [days, setDays] = useState<string[]>([]);
  const [workouts, setWorkouts] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const db = useContext(DatabaseContext);

  useEffect(() => {
    const refresh = async () => {
      const [namesResult] = await db.executeSql(
        'SELECT DISTINCT name FROM sets',
      );
      if (!namesResult.rows.length) return setNames([]);
      setNames(namesResult.rows.raw().map(({name}) => name));
      if (!plan) return;
      if (plan.days) setDays(plan.days.split(','));
      if (plan.workouts) setWorkouts(plan.workouts.split(','));
    };
    refresh();
  }, [plan, db]);

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
    setPlan(undefined);
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
      <Dialog visible={!!plan} onDismiss={() => setPlan(undefined)}>
        <Dialog.Title>
          {plan?.days ? `Edit "${days.slice(0, 2).join(', ')}"` : 'Add a plan'}
        </Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView
            style={{height: '80%'}}
            contentContainerStyle={{paddingHorizontal: 24}}>
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
            <Text style={[styles.title, {marginTop: 10}]}>Workouts</Text>
            {names.length === 0 && (
              <Text style={{maxWidth: '80%'}}>
                No sets found. Try going to the home page and adding some
                workouts first.
              </Text>
            )}
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
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button icon="close" onPress={() => setPlan(undefined)}>
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
    flexWrap: 'wrap',
  },
});
