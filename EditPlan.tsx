import React, {useContext, useEffect, useState} from 'react';
import {Button, Dialog, Portal} from 'react-native-paper';
import {DatabaseContext} from './App';
import DayMenu from './DayMenu';
import {Plan} from './plan';
import WorkoutMenu from './WorkoutMenu';

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
  const [names, setNames] = useState<string[]>([]);
  const db = useContext(DatabaseContext);

  const refresh = async () => {
    const [namesResult] = await db.executeSql('SELECT DISTINCT name FROM sets');
    if (!namesResult.rows.length) return;
    setNames(namesResult.rows.raw().map(({name}) => name));
    if (!id) return;
    const [result] = await db.executeSql(`SELECT * FROM plans WHERE id = ?`, [
      id,
    ]);
    if (!result.rows.item(0)) throw new Error("Can't find specified Set.");
    const set: Plan = result.rows.item(0);
    setDays(set.days);
    setWorkouts(set.workouts);
  };

  useEffect(() => {
    refresh();
  }, [id]);

  const save = async () => {
    if (!days || !workouts) return;
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

  const selectWorkout = (workout: string, index: number) => {
    const newWorkouts = workouts.split(',');
    newWorkouts[index] = workout;
    setWorkouts(newWorkouts.join(','));
  };

  const removeWorkout = (index: number) => {
    const newWorkouts = workouts.split(',');
    delete newWorkouts[index];
    setWorkouts(newWorkouts.filter(day => day).join(','));
  };

  const removeDay = (index: number) => {
    const newDays = days.split(',');
    delete newDays[index];
    setDays(newDays.filter(day => day).join(','));
  };

  return (
    <Portal>
      <Dialog visible={show} onDismiss={() => setShow(false)}>
        <Dialog.Title>{id ? `Edit "${days}"` : 'Add a plan'}</Dialog.Title>
        <Dialog.Content>
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
          <Button icon="add" onPress={() => setDays(days + ',Monday')}>
            Add day
          </Button>
          {workouts.split(',').map((workout, index) => (
            <WorkoutMenu
              index={index}
              selected={workout}
              onAdd={() => setWorkouts(workouts + ',')}
              onSelect={option => selectWorkout(option, index)}
              onDelete={() => removeWorkout(index)}
              names={names}
              key={index}
            />
          ))}
          <Button icon="add" onPress={() => setWorkouts(workouts + ',')}>
            Add workout
          </Button>
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
