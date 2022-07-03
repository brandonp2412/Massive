import React, {useEffect, useRef, useState} from 'react';
import {Modal, StyleSheet, Text, TextInput, View} from 'react-native';
import {Button} from 'react-native-paper';
import {getDb} from './db';
import Set from './Set';

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
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const unitRef = useRef<TextInput>(null);

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
    <View>
      <Modal
        animationType="none"
        transparent={true}
        visible={show}
        onRequestClose={() => setShow(false)}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add a set</Text>
          <TextInput
            autoFocus
            placeholder="Name *"
            value={name}
            onChangeText={setName}
            onSubmitEditing={() => weightRef.current?.focus()}
          />
          <TextInput
            placeholder="Weight *"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            onSubmitEditing={() => repsRef.current?.focus()}
            ref={weightRef}
          />
          <TextInput
            placeholder="Reps *"
            keyboardType="numeric"
            value={reps}
            onChangeText={setReps}
            ref={repsRef}
            onSubmitEditing={() => unitRef.current?.focus()}
          />
          <TextInput
            placeholder="Unit (kg)"
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
        </View>
      </Modal>
      <Button
        mode="contained"
        onPress={() => {
          setId(undefined);
          setShow(true);
        }}>
        Add
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  bottom: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 20,
  },
  modal: {
    margin: 20,
    backgroundColor: '#20232a',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
