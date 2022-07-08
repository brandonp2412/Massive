import {format} from 'date-fns';
import React, {useContext} from 'react';
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
  const db = useContext(DatabaseContext);

  const save = async () => {
    if (!set?.name || !set?.reps || !set?.weight) return;
    if (!set?.id)
      await db.executeSql(
        `INSERT INTO sets(name, reps, weight, created, unit) VALUES (?,?,?,?,?)`,
        [
          set.name,
          set.reps,
          set.weight,
          new Date().toISOString(),
          set.unit || 'kg',
        ],
      );
    else
      await db.executeSql(
        `UPDATE sets SET name = ?, reps = ?, weight = ?, unit = ? WHERE id = ?`,
        [set.name, set.reps, set.weight, set.unit, set.id],
      );
    setSet(undefined);
    onSave();
  };

  return (
    <Portal>
      <Dialog visible={!!set} onDismiss={() => setSet(undefined)}>
        <Dialog.Title>
          {set?.id ? `Edit "${set.name}"` : 'Add a set'}
        </Dialog.Title>
        <Dialog.Content>
          <TextInput
            style={styles.text}
            autoFocus
            label="Name *"
            value={set?.name}
            onChangeText={name => setSet({...set, name})}
            autoCorrect={false}
          />
          <TextInput
            style={styles.text}
            label="Reps *"
            keyboardType="numeric"
            value={set?.reps?.toString() || ''}
            onChangeText={reps => setSet({...set, reps})}
          />
          <TextInput
            style={styles.text}
            label="Weight *"
            keyboardType="numeric"
            value={set?.weight?.toString() || ''}
            onChangeText={weight => setSet({...set, weight})}
            onSubmitEditing={save}
          />
          <TextInput
            style={styles.text}
            label="Unit (kg)"
            value={set?.unit}
            onChangeText={unit => setSet({...set, unit})}
            onSubmitEditing={save}
          />
          <Text style={styles.text}>
            {format(new Date(set?.created || 0), 'PPPP p')}
          </Text>
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
