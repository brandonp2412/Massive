import React, {useCallback, useContext, useRef, useState} from 'react';
import {TextInput, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Button, Card, TouchableRipple} from 'react-native-paper';
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
}: {
  set: Set;
  save: (set: Set) => void;
}) {
  const [name, setName] = useState(set.name);
  const [reps, setReps] = useState(set.reps.toString());
  const [weight, setWeight] = useState(set.weight.toString());
  const [newImage, setNewImage] = useState(set.image);
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
    console.log(`${SetForm.name}.handleSubmit:`, {set, uri: newImage, name});
    if (!name) return;
    let image = newImage;
    if (!newImage && !removeImage)
      image = await getSets({search: name, limit: 1, offset: 0}).then(
        ([gotSet]) => gotSet?.image,
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
    if (fileCopyUri) setNewImage(fileCopyUri);
  }, []);

  const handleRemove = useCallback(async () => {
    setNewImage('');
    setRemoveImage(true);
    setShowRemove(false);
  }, []);

  return (
    <>
      <View style={{flex: 1}}>
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
        {!!settings.images && newImage && (
          <TouchableRipple
            style={{marginBottom: MARGIN}}
            onPress={changeImage}
            onLongPress={() => setShowRemove(true)}>
            <Card.Cover source={{uri: newImage}} />
          </TouchableRipple>
        )}
        {!!settings.images && !newImage && (
          <Button
            style={{marginBottom: MARGIN}}
            onPress={changeImage}
            icon="add-photo-alternate">
            Image
          </Button>
        )}
      </View>
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
