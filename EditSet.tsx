import {format} from 'date-fns';
import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import {Button, Dialog, Portal, TextInput} from 'react-native-paper';
import {DatabaseContext} from './App';
import Set from './set';

export default function EditSet({
  onSave,
  set,
  setSet,
}: {
  onSave: () => void;
  set?: Set;
  setSet: (set?: Set) => void;
}) {
  const [newSet, setNewSet] = useState({
    name: '',
    reps: '',
    weight: '',
    unit: '',
    created: new Date(),
  });
  const db = useContext(DatabaseContext);

  useEffect(() => {
    if (set?.id)
      setNewSet({
        ...set,
        reps: set.reps.toString(),
        weight: set.weight.toString(),
        created: new Date(set.created),
      });
  }, [set]);

  const save = async () => {
    if (!newSet.name || !newSet.reps || !newSet.weight) return;
    if (!set?.id)
      await db.executeSql(
        `INSERT INTO sets(name, reps, weight, created, unit) VALUES (?,?,?,?,?)`,
        [
          newSet.name,
          newSet.reps,
          newSet.weight,
          new Date().toUTCString(),
          newSet.unit || 'kg',
        ],
      );
    else
      await db.executeSql(
        `UPDATE sets SET name = ?, reps = ?, weight = ?, unit = ? WHERE id = ?`,
        [newSet.name, newSet.reps, newSet.weight, newSet.unit, set.id],
      );
    setSet(undefined);
    onSave();
  };

  return (
    <Portal>
      <Dialog visible={!!set} onDismiss={() => setSet(undefined)}>
        <Dialog.Title>
          {set?.id ? `Edit "${newSet.name}"` : 'Add a set'}
        </Dialog.Title>
        <Dialog.Content>
          <TextInput
            style={styles.text}
            autoFocus
            label="Name *"
            value={newSet.name}
            onChangeText={name => setNewSet({...newSet, name})}
            autoCorrect={false}
          />
          <TextInput
            style={styles.text}
            label="Reps *"
            keyboardType="numeric"
            value={newSet.reps}
            onChangeText={reps => setNewSet({...newSet, reps})}
          />
          <TextInput
            style={styles.text}
            label="Weight *"
            keyboardType="numeric"
            value={newSet.weight}
            onChangeText={weight => setNewSet({...newSet, weight})}
            onSubmitEditing={save}
          />
          <TextInput
            style={styles.text}
            label="Unit (kg)"
            value={newSet.unit}
            onChangeText={unit => setNewSet({...newSet, unit})}
            onSubmitEditing={save}
          />
          <Text style={styles.text}>{format(newSet.created, 'PPPP p')}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button icon="close" onPress={() => setSet(undefined)}>
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
