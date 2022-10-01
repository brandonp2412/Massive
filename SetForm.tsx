import React, {useCallback, useContext, useRef, useState} from 'react';
import {ScrollView, TextInput, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Button, Card, Text, TouchableRipple} from 'react-native-paper';
import ConfirmDialog from './ConfirmDialog';
import {MARGIN} from './constants';
import MassiveInput from './MassiveInput';
import {SnackbarContext} from './MassiveSnack';
import Set from './set';
import {getSets} from './set.service';
import {useSettings} from './use-settings';

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
  const [uri, setUri] = useState(set.image);
  const [unit, setUnit] = useState(set.unit);
  const [showRemove, setShowRemove] = useState(false);
  const [selection, setSelection] = useState({
    start: 0,
    end: set.reps.toString().length,
  });
  const [removeImage, setRemoveImage] = useState(false);
  const {toast} = useContext(SnackbarContext);
  const {settings} = useSettings();
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const unitRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    console.log(`${SetForm.name}.handleSubmit:`, {set, uri, name});
    if (!name) return;
    let image = uri;
    if (!uri && !set.image && !removeImage)
      image = await getSets({search: name, limit: 1, offset: 0}).then(
        ([s]) => s?.image,
      );
    console.log(`${SetForm.name}.handleSubmit:`, {image});
    save({
      name,
      reps: Number(reps),
      weight: Number(weight),
      id: set.id,
      unit,
      image,
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

  const changeImage = useCallback(async () => {
    const {fileCopyUri} = await DocumentPicker.pickSingle({
      type: 'image/*',
      copyTo: 'documentDirectory',
    });
    if (fileCopyUri) setUri(fileCopyUri);
  }, []);

  const handleRemove = useCallback(async () => {
    setUri('');
    setRemoveImage(true);
    setShowRemove(false);
  }, []);

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
          <View style={{flexDirection: 'row', marginBottom: MARGIN}}>
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
        {!!settings.images && uri && (
          <TouchableRipple
            style={{marginBottom: MARGIN}}
            onPress={changeImage}
            onLongPress={() => setShowRemove(true)}>
            <Card.Cover source={{uri}} />
          </TouchableRipple>
        )}
        {!!settings.images && !uri && (
          <Button
            style={{marginBottom: MARGIN}}
            onPress={changeImage}
            icon="add-photo-alternate">
            Image
          </Button>
        )}
      </ScrollView>
      <Button
        disabled={!name}
        mode="contained"
        icon="save"
        onPress={handleSubmit}>
        Save
      </Button>
      <ConfirmDialog
        title="Remove image"
        onOk={handleRemove}
        show={showRemove}
        setShow={setShowRemove}>
        Are you sure you want to remove the image?
      </ConfirmDialog>
    </>
  );
}
