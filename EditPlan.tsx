import {setDay} from 'date-fns';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Modal, Portal, TextInput} from 'react-native-paper';
import DayMenu from './DayMenu';
import {getDb} from './db';
import {Plan} from './plan';
import Set from './set';

export default function EditPlan({
  id,
  onSave,
  show,
  setShow,
  clearId,
}: {
  id?: number;
  clearId: () => void;
  onSave: () => void;
  show: boolean;
  setShow: (visible: boolean) => void;
}) {
  const [days, setDays] = useState('');
  const [workouts, setWorkouts] = useState('');

  useEffect(() => {
    if (!id) return;
    getDb().then(async db => {
      const [result] = await db.executeSql(`SELECT * FROM plans WHERE id = ?`, [
        id,
      ]);
      if (!result.rows.item(0)) throw new Error("Can't find specified Set.");
      const set: Plan = result.rows.item(0);
      setDays(set.days);
      setWorkouts(set.workouts);
    });
  }, [id]);

  const save = async () => {
    if (!days || !workouts) return;
    const db = await getDb();
    if (!id)
      await db.executeSql(`INSERT INTO plans(days, workouts) VALUES (?, ?)`, [
        days,
        workouts,
      ]);
    else
      await db.executeSql(
        `UPDATE plans SET days = ?, workouts = ? WHERE id = ?`,
        [days, workouts, id],
      );
    setShow(false);
    onSave();
  };

  const selectDay = (day: string, index: number) => {
    const newDays = days.split(',');
    newDays[index] = day;
    setDays(newDays.join(','));
  };

  const removeDay = (index: number) => {
    const newDays = days.split(',');
    delete newDays[index];
    setDays(newDays.filter(day => day).join(','));
  };

  return (
    <Portal>
      <Modal
        visible={show}
        contentContainerStyle={styles.modal}
        onDismiss={() => setShow(false)}>
        <Text style={styles.title}>{id ? `Edit "${days}"` : 'Add a plan'}</Text>
        <View style={{alignItems: 'flex-start'}}>
          {days.split(',').map((day, index) => (
            <DayMenu
              index={index}
              onDelete={() => removeDay(index)}
              onSelect={option => selectDay(option, index)}
              onAdd={() => setDays(days + ',Monday')}
              selected={day}
              key={index}
            />
          ))}
        </View>
        <TextInput
          style={styles.text}
          label="Workouts *"
          value={workouts}
          onChangeText={setWorkouts}
        />
        <View style={styles.bottom}>
          <Button mode="contained" icon="save" onPress={save}>
            Save
          </Button>
          <Button icon="close" onPress={() => setShow(false)}>
            Cancel
          </Button>
          {id && (
            <Button icon="copy" onPress={clearId}>
              Duplicate
            </Button>
          )}
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'black',
    padding: 20,
  },
  text: {
    marginBottom: 10,
  },
  bottom: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
});
