import React, {useContext, useEffect, useRef, useState} from 'react';
import {ScrollView} from 'react-native';
import {Button} from 'react-native-paper';
import MassiveInput from './MassiveInput';
import {SnackbarContext} from './MassiveSnack';
import Set from './set';
import {getSets} from './set.service';
import {settings} from './settings.service';

export default function SetForm({
  save,
  set,
  workouts,
}: {
  set: Set;
  save: (set: Set) => void;
  workouts: string[];
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
  const {toast} = useContext(SnackbarContext);
  const weightRef = useRef<any>(null);
  const repsRef = useRef<any>(null);
  const unitRef = useRef<any>(null);

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
      minutes: Number(set.minutes ?? 3),
      seconds: Number(set.seconds ?? 30),
      sets: set.sets ?? 3,
    });
  };

  const handleName = (value: string) => {
    setName(value.replace(/,|'/g, ''));
    if (value.match(/,|'/))
      toast('Commas and single quotes would break CSV exports', 6000);
  };

  const handleUnit = (value: string) => {
    setUnit(value.replace(/,|'/g, ''));
    if (value.match(/,|'/))
      toast('Commas and single quotes would break CSV exports', 6000);
  };

  return (
    <>
      <ScrollView style={{height: '90%'}}>
        <MassiveInput
          label="Name"
          value={name}
          onChangeText={handleName}
          autoCorrect={false}
          autoFocus={!name}
          blurOnSubmit={false}
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
        {!!settings.showUnit && (
          <MassiveInput
            autoCapitalize="none"
            label="Unit"
            value={unit}
            onChangeText={handleUnit}
            innerRef={unitRef}
          />
        )}
        {workouts.length > 0 && !!settings.workouts && (
          <MassiveInput
            label="Todays workout"
            value={workouts?.join(', ')}
            editable={false}
          />
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
