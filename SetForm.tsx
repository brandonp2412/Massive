import React, {useContext, useRef, useState} from 'react';
import {ScrollView, TextInput, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
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
  const [selection, setSelection] = useState({
    start: 0,
    end: set.reps.toString().length,
  });
  const {toast} = useContext(SnackbarContext);
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const unitRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    console.log(`${SetForm.name}.handleSubmit:`, {set});
    if (!name) return;
    let saveImage = set.image;
    if (!set.image)
      saveImage = await getSets({search: name, limit: 1, offset: 0}).then(
        ([s]) => s?.image,
      );
    console.log(`${SetForm.name}.handleSubmit:`, {saveImage, name});
    save({
      name,
      reps: Number(reps),
      weight: Number(weight),
      id: set.id,
      unit,
      image: saveImage,
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
          <View style={{flexDirection: 'row'}}>
            {workouts.map((workout, index) => (
              <Text key={workout}>
                <Text
                  style={
                    workout === name
                      ? {textDecorationLine: 'underline', fontWeight: 'bold'}
                      : null
                  }>
                  {workout}
                </Text>
                {index === workouts.length - 1 ? '' : ', '}
              </Text>
            ))}
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
