import React, {useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import Set from './set';

export default function SetForm({
  save,
  set,
}: {
  set: Set;
  save: (set: Set) => void;
}) {
  const [name, setName] = useState(set.name);
  const [reps, setReps] = useState(set.reps.toString());
  const [weight, setWeight] = useState(set.weight.toString());
  const [unit, setUnit] = useState(set.unit);
  const [selection, setSelection] = useState({
    start: 0,
    end: set.reps.toString().length,
  });
  const weightRef = useRef<any>(null);
  const handleSubmit = () => {
    save({
      name,
      reps: Number(reps),
      created: set.created,
      weight: Number(weight),
      id: set.id,
      unit,
    });
  };

  return (
    <>
      <ScrollView style={{height: '90%'}}>
        <TextInput
          style={styles.marginBottom}
          label="Name"
          value={name}
          onChangeText={setName}
          autoCorrect={false}
          selectTextOnFocus
        />
        <TextInput
          style={styles.marginBottom}
          label="Reps"
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
          onSubmitEditing={() => weightRef.current?.focus()}
          selection={selection}
          onSelectionChange={e => setSelection(e.nativeEvent.selection)}
          autoFocus
          selectTextOnFocus
          blurOnSubmit={false}
        />
        <TextInput
          style={styles.marginBottom}
          label="Weight"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          onSubmitEditing={handleSubmit}
          ref={weightRef}
          selectTextOnFocus
        />
        <TextInput
          style={styles.marginBottom}
          label="Unit (kg)"
          value={unit}
          onChangeText={setUnit}
          onSubmitEditing={handleSubmit}
          selectTextOnFocus
        />
        <Text>{set.created?.replace('T', ' ')}</Text>
      </ScrollView>
      <Button mode="contained" icon="save" onPress={handleSubmit}>
        Save
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: 10,
  },
});
