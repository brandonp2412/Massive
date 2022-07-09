import {format} from 'date-fns';
import React, {useContext} from 'react';
import {StyleSheet, Text} from 'react-native';
import {Button, Dialog, Portal, TextInput} from 'react-native-paper';
import {DatabaseContext} from './App';
import Set from './set';

export default function EditSet({
  onUpdate,
  onCreate,
  set,
  setSet,
}: {
  onUpdate: () => void;
  onCreate: () => void;
  set?: Set;
  setSet: (set?: Set) => void;
}) {
  const db = useContext(DatabaseContext);

  const update = async () => {
    console.log(`${EditSet.name}.${update.name}`, {set});
    await db.executeSql(
      `INSERT INTO sets(name, reps, weight, created, unit) VALUES (?,?,?,?,?)`,
      [
        set?.name,
        set?.reps,
        set?.weight,
        new Date().toISOString(),
        set?.unit || 'kg',
      ],
    );
    onUpdate();
  };

  const create = async () => {
    console.log(`${EditSet.name}.${create.name}`, {set});
    await db.executeSql(
      `UPDATE sets SET name = ?, reps = ?, weight = ?, unit = ? WHERE id = ?`,
      [set?.name, set?.reps, set?.weight, set?.unit, set?.id],
    );
    onCreate();
  };

  const save = async () => {
    if (!set?.name || set?.reps === undefined || set?.weight === undefined)
      return;
    if (set?.id) await update();
    else await create();
    setSet(undefined);
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
            {format(
              set?.created ? new Date(set.created) : new Date(),
              'PPPP p',
            )}
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
});
