import React, {useContext, useEffect, useRef, useState} from 'react';
import {ScrollView} from 'react-native';
import {Button, Text} from 'react-native-paper';
import MassiveInput from './MassiveInput';
import {DatabaseContext} from './Routes';
import Set from './set';

export default function SetForm({
  save,
  set,
  workouts,
}: {
  set: Set;
  save: (set: Set) => void;
  workouts?: string[];
}) {
  const [name, setName] = useState(set.name);
  const [reps, setReps] = useState(set.reps.toString());
  const [weight, setWeight] = useState(set.weight.toString());
  const [unit, setUnit] = useState(set.unit);
  const [uri, setUri] = useState(set.image);
  const [selection, setSelection] = useState({
    start: 0,
    end: set.reps.toString().length,
  });
  const weightRef = useRef<any>(null);
  const repsRef = useRef<any>(null);
  const db = useContext(DatabaseContext);

  useEffect(() => {
    console.log('SetForm.useEffect:', {uri, name: set.name});
    if (!uri)
      db.executeSql(`SELECT image FROM sets WHERE name = ? LIMIT 1`, [
        set.name,
      ]).then(([result]) => setUri(result.rows.item(0)?.image));
  }, [uri, db, set.name]);

  const handleSubmit = () => {
    if (!name) return;
    save({
      name,
      reps: Number(reps),
      weight: Number(weight),
      id: set.id,
      unit,
      image: uri,
    });
  };

  return (
    <>
      <ScrollView style={{height: '90%'}}>
        <MassiveInput
          label="Name"
          value={name}
          onChangeText={setName}
          autoCorrect={false}
          autoFocus={!name}
          onSubmitEditing={() => repsRef.current?.focus()}
        />
        <MassiveInput
          label="Reps"
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
          onSubmitEditing={() => weightRef.current?.focus()}
          selection={selection}
          onSelectionChange={e => setSelection(e.nativeEvent.selection)}
          autoFocus={!!name}
          blurOnSubmit={false}
          innerRef={repsRef}
        />
        <MassiveInput
          label="Weight"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          onSubmitEditing={handleSubmit}
          innerRef={weightRef}
        />
        <MassiveInput
          label="Unit (kg)"
          value={unit}
          onChangeText={setUnit}
          onSubmitEditing={handleSubmit}
        />
        <Text style={{marginBottom: 10}}>
          {workouts?.map((workout, index) => (
            <React.Fragment key={workout}>
              <Text
                style={{
                  fontWeight: workout === name ? 'bold' : 'normal',
                  textDecorationLine: workout === name ? 'underline' : 'none',
                }}>
                {workout}
              </Text>
              {index === workouts.length - 1 ? '.' : ', '}
            </React.Fragment>
          ))}
        </Text>
      </ScrollView>
      <Button
        disabled={!name}
        mode="contained"
        icon="save"
        onPress={handleSubmit}>
        Save
      </Button>
    </>
  );
}
