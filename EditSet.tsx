import {format} from 'date-fns';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import {Button, Dialog, Portal, TextInput} from 'react-native-paper';
import {DatabaseContext} from './App';
import Set from './set';

export default function EditSet({
  onSave,
  show,
  setShow,
  set,
}: {
  onSave: () => void;
  show: boolean;
  setShow: (visible: boolean) => void;
  set?: Set;
}) {
  const [name, setName] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('');
  const [created, setCreated] = useState(new Date(new Date().toUTCString()));
  const weightRef = useRef<any>(null);
  const repsRef = useRef<any>(null);
  const unitRef = useRef<any>(null);
  const db = useContext(DatabaseContext);

  const refresh = async () => {
    if (!set) return setCreated(new Date(new Date().toUTCString()));
    setName(set.name);
    setReps(set.reps.toString());
    setWeight(set.weight.toString());
    setUnit(set.unit);
    setCreated(new Date(set.created));
  };

  useEffect(() => {
    refresh();
  }, [set]);

  const save = async () => {
    if (!name || !reps || !weight) return;
    if (!set)
      await db.executeSql(
        `INSERT INTO sets(name, reps, weight, created, unit) VALUES (?,?,?,?,?)`,
        [name, reps, weight, new Date().toISOString(), unit || 'kg'],
      );
    else
      await db.executeSql(
        `UPDATE sets SET name = ?, reps = ?, weight = ?, unit = ? WHERE id = ?`,
        [name, reps, weight, unit, set.id],
      );
    setShow(false);
    onSave();
  };

  return (
    <Portal>
      <Dialog visible={show} onDismiss={() => setShow(false)}>
        <Dialog.Title>{set?.id ? `Edit "${name}"` : 'Add a set'}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            style={styles.text}
            autoFocus
            label="Name *"
            value={name}
            onChangeText={setName}
            onSubmitEditing={() => repsRef.current?.focus()}
            autoCorrect={false}
          />
          <TextInput
            style={styles.text}
            label="Reps *"
            keyboardType="numeric"
            value={reps}
            onChangeText={setReps}
            ref={repsRef}
            onSubmitEditing={() => weightRef.current?.focus()}
          />
          <TextInput
            style={styles.text}
            label="Weight *"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            onSubmitEditing={save}
            ref={weightRef}
          />
          <TextInput
            style={styles.text}
            label="Unit (kg)"
            value={unit}
            onChangeText={setUnit}
            ref={unitRef}
            onSubmitEditing={save}
          />
          <Text style={styles.text}>{format(created, 'PPPP p')}</Text>
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
  text: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
});
