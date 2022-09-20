import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {Button} from 'react-native-paper';
import {MARGIN} from './constants';
import MassiveInput from './MassiveInput';
import Set from './set';
import {getSets} from './set.service';

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
  const [minutes, setMinutes] = useState(set.minutes?.toString());
  const [seconds, setSeconds] = useState(set.seconds?.toString());
  const [selection, setSelection] = useState({
    start: 0,
    end: set.reps.toString().length,
  });
  const weightRef = useRef<any>(null);
  const repsRef = useRef<any>(null);
  const unitRef = useRef<any>(null);
  const minutesRef = useRef<any>(null);
  const secondsRef = useRef<any>(null);

  useEffect(() => {
    console.log('SetForm.useEffect:', {uri, name: set.name});
    if (!uri)
      getSets({search: set.name, limit: 1, offset: 0}).then(([s]) =>
        setUri(s?.image),
      );
  }, [uri, set.name]);

  const handleSubmit = () => {
    if (!name) return;
    save({
      name,
      reps: Number(reps),
      weight: Number(weight),
      id: set.id,
      unit,
      image: uri,
      minutes: Number(minutes ?? 3),
      seconds: Number(seconds ?? 30),
      sets: set.sets ?? 3,
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
          onSubmitEditing={() => unitRef.current?.focus()}
          innerRef={weightRef}
        />
        <MassiveInput
          autoCapitalize="none"
          label="Unit"
          value={unit}
          onChangeText={setUnit}
          onSubmitEditing={() => minutesRef.current?.focus()}
          innerRef={unitRef}
        />
        {workouts && (
          <MassiveInput
            label="Todays workout"
            value={workouts?.join(', ')}
            editable={false}
          />
        )}
        {!set.id && (
          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            <MassiveInput
              style={{width: '48%'}}
              label="Rest minutes"
              value={minutes}
              onChangeText={setMinutes}
              innerRef={minutesRef}
              onSubmitEditing={() => secondsRef.current?.focus()}
            />
            <MassiveInput
              style={{width: '48%', marginLeft: MARGIN}}
              label="Rest seconds"
              value={seconds}
              onChangeText={setSeconds}
              innerRef={secondsRef}
            />
          </View>
        )}
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
