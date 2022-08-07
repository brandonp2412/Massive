import React, {useRef, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Button, TextInput} from 'react-native-paper';
import Set from './set';
import {format} from './time';

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
  const [created, setCreated] = useState(new Date(set.created));
  const [unit, setUnit] = useState(set.unit);
  const [showDate, setShowDate] = useState(false);
  const [selection, setSelection] = useState({
    start: 0,
    end: set.reps.toString().length,
  });
  const weightRef = useRef<any>(null);

  const onConfirm = (date: Date) => {
    setCreated(date);
    setShowDate(false);
  };

  const handleSubmit = () => {
    save({
      name,
      reps: Number(reps),
      created: created.toISOString(),
      weight: Number(weight),
      id: set.id,
      unit,
    });
  };

  const textInputs = (
    <>
      <TextInput
        style={styles.marginBottom}
        label="Name"
        value={name}
        onChangeText={setName}
        autoCorrect={false}
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
      />
    </>
  );

  return (
    <>
      <ScrollView style={{height: '90%'}}>
        {textInputs}
        <Button
          style={styles.marginBottom}
          icon="calendar-outline"
          onPress={() => setShowDate(true)}>
          {format(created)}
        </Button>
        <DateTimePickerModal
          isVisible={showDate}
          mode="datetime"
          onConfirm={onConfirm}
          onCancel={() => setShowDate(false)}
          date={created}
        />
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
