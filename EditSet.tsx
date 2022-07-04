import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Modal, Portal, TextInput} from 'react-native-paper';
import {getDb} from './db';
import Set from './set';

export default function EditSet({
  id,
  onSave,
  show,
  setShow,
  setId,
}: {
  id?: number;
  setId: (id?: number) => void;
  onSave: () => void;
  show: boolean;
  setShow: (visible: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('');
  const weightRef = useRef<any>(null);
  const repsRef = useRef<any>(null);
  const unitRef = useRef<any>(null);

  useEffect(() => {
    if (!id) return;
    getDb().then(async db => {
      const [result] = await db.executeSql(`SELECT * FROM sets WHERE id = ?`, [
        id,
      ]);
      if (!result.rows.item(0)) throw new Error("Can't find specified Set.");
      const set: Set = result.rows.item(0);
      setName(set.name);
      setReps(set.reps.toString());
      setWeight(set.weight.toString());
      setUnit(set.unit);
    });
  }, [id]);

  const save = async () => {
    if (!name || !reps || !weight) return;
    const db = await getDb();
    if (!id)
      await db.executeSql(
        `INSERT INTO sets(name, reps, weight, created, unit) VALUES (?,?,?,?,?)`,
        [name, reps, weight, new Date().toISOString(), unit || 'kg'],
      );
    else
      await db.executeSql(
        `UPDATE sets SET name = ?, reps = ?, weight = ?, unit = ? WHERE id = ?`,
        [name, reps, weight, unit, id],
      );
    setShow(false);
    onSave();
  };

  const remove = async () => {
    if (!id) return;
    const db = await getDb();
    await db.executeSql(`DELETE FROM sets WHERE id = ?`, [id]);
    setShow(false);
    onSave();
  };

  return (
    <>
      <Portal>
        <Modal
          visible={show}
          contentContainerStyle={styles.modal}
          onDismiss={() => setShow(false)}>
          <Text style={styles.title}>Add a set</Text>
          <TextInput
            style={styles.text}
            autoFocus
            label="Name *"
            value={name}
            onChangeText={setName}
            onSubmitEditing={() => repsRef.current?.focus()}
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
          <View style={styles.bottom}>
            <Button mode="contained" icon="save" onPress={save}>
              Save
            </Button>
            <Button icon="close" onPress={() => setShow(false)}>
              Cancel
            </Button>
            <Button icon="trash" onPress={remove} disabled={!id}>
              Delete
            </Button>
          </View>
        </Modal>
      </Portal>

      <Button
        icon="add"
        mode="contained"
        onPress={() => {
          setId(undefined);
          setShow(true);
        }}>
        Add
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  modal: {
    height: '100%',
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
