import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useContext, useRef, useState} from 'react';
import {ScrollView, TextInput, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Button, Card, IconButton, TouchableRipple} from 'react-native-paper';
import ConfirmDialog from './ConfirmDialog';
import {MARGIN, PADDING} from './constants';
import MassiveInput from './MassiveInput';
import {SnackbarContext} from './MassiveSnack';
import {updatePlanWorkouts} from './plan.service';
import {addSet, updateManySet, updateSetImage} from './set.service';
import {useSettings} from './use-settings';
import {WorkoutsPageParams} from './WorkoutsPage';

export default function EditWorkout() {
  const {params} = useRoute<RouteProp<WorkoutsPageParams, 'EditWorkout'>>();
  const [removeImage, setRemoveImage] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [name, setName] = useState(params.value.name);
  const [steps, setSteps] = useState(params.value.steps);
  const [uri, setUri] = useState(params.value.image);
  const [minutes, setMinutes] = useState(
    params.value.minutes?.toString() ?? '3',
  );
  const [seconds, setSeconds] = useState(
    params.value.seconds?.toString() ?? '30',
  );
  const [sets, setSets] = useState(params.value.sets?.toString() ?? '3');
  const {toast} = useContext(SnackbarContext);
  const navigation = useNavigation();
  const setsRef = useRef<TextInput>(null);
  const stepsRef = useRef<TextInput>(null);
  const minutesRef = useRef<TextInput>(null);
  const secondsRef = useRef<TextInput>(null);
  const {settings} = useSettings();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        headerRight: null,
        title: params.value.name || 'New workout',
      });
      if (!name) return;
    }, [navigation, name, params.value.name]),
  );

  const update = async () => {
    await updateManySet({
      oldName: params.value.name,
      newName: name || params.value.name,
      sets: sets ?? '3',
      seconds: seconds?.toString() ?? '30',
      minutes: minutes?.toString() ?? '3',
      steps,
    });
    await updatePlanWorkouts(params.value.name, name || params.value.name);
    if (uri || removeImage) await updateSetImage(params.value.name, uri || '');
    navigation.goBack();
  };

  const add = async () => {
    await addSet({
      name,
      reps: 0,
      weight: 0,
      hidden: true,
      image: uri,
      minutes: minutes ? +minutes : 3,
      seconds: seconds ? +seconds : 30,
      sets: sets ? +sets : 3,
      steps,
    });
    navigation.goBack();
  };

  const save = async () => {
    if (params.value.name) return update();
    return add();
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

  const handleName = (value: string) => {
    setName(value.replace(/,|'/g, ''));
    if (value.match(/,|'/))
      toast('Commas and single quotes would break CSV exports', 6000);
  };

  const handleSteps = (value: string) => {
    setSteps(value.replace(/,|'/g, ''));
    if (value.match(/,|'/))
      toast('Commas and single quotes would break CSV exports', 6000);
  };

  const submitName = () => {
    if (settings.steps) stepsRef.current?.focus();
    else setsRef.current?.focus();
  };

  return (
    <View style={{padding: PADDING}}>
      <ScrollView style={{height: '90%'}}>
        <MassiveInput
          autoFocus
          label="Name"
          value={name}
          onChangeText={handleName}
          onSubmitEditing={submitName}
        />
        {!!settings.steps && (
          <MassiveInput
            innerRef={stepsRef}
            selectTextOnFocus={false}
            value={steps}
            onChangeText={handleSteps}
            label="Steps"
            multiline
            onSubmitEditing={() => setsRef.current?.focus()}
          />
        )}
        <MassiveInput
          innerRef={setsRef}
          value={sets}
          onChangeText={setSets}
          label="Sets per workout"
          keyboardType="numeric"
          onSubmitEditing={() => minutesRef.current?.focus()}
        />
        <MassiveInput
          innerRef={minutesRef}
          onSubmitEditing={() => secondsRef.current?.focus()}
          value={minutes}
          onChangeText={setMinutes}
          label="Rest minutes"
          keyboardType="numeric"
        />
        <MassiveInput
          innerRef={secondsRef}
          value={seconds}
          onChangeText={setSeconds}
          label="Rest seconds"
          keyboardType="numeric"
          blurOnSubmit
        />
        {uri ? (
          <TouchableRipple
            style={{marginBottom: MARGIN}}
            onPress={changeImage}
            onLongPress={() => setShowRemove(true)}>
            <Card.Cover source={{uri}} />
          </TouchableRipple>
        ) : (
          <Button
            style={{marginBottom: MARGIN}}
            onPress={changeImage}
            icon="add-photo-alternate">
            Image
          </Button>
        )}
      </ScrollView>
      <Button disabled={!name} mode="contained" icon="save" onPress={save}>
        Save
      </Button>
      <ConfirmDialog
        title="Remove image"
        onOk={handleRemove}
        show={showRemove}
        setShow={setShowRemove}>
        Are you sure you want to remove the image?
      </ConfirmDialog>
    </View>
  );
}
