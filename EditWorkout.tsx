import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useCallback, useRef, useState} from 'react';
import {ScrollView, TextInput, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Button, Card, TouchableRipple} from 'react-native-paper';
import {Like} from 'typeorm';
import ConfirmDialog from './ConfirmDialog';
import {MARGIN, PADDING} from './constants';
import {getNow, planRepo, setRepo} from './db';
import MassiveInput from './MassiveInput';
import {useSnackbar} from './MassiveSnack';
import StackHeader from './StackHeader';
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
  const {toast} = useSnackbar();
  const navigation = useNavigation();
  const setsRef = useRef<TextInput>(null);
  const stepsRef = useRef<TextInput>(null);
  const minutesRef = useRef<TextInput>(null);
  const secondsRef = useRef<TextInput>(null);
  const {settings} = useSettings();

  const update = async () => {
    await setRepo.update(
      {name: params.value.name},
      {
        name: name || params.value.name,
        sets: Number(sets),
        minutes: +minutes,
        seconds: +seconds,
        steps,
        image: removeImage ? '' : uri,
      },
    );
    await planRepo.query(
      `UPDATE plans 
       SET workouts = REPLACE(workouts, $1, $2) 
       WHERE workouts LIKE $3`,
      [params.value.name, name, `%${params.value.name}%`],
    );
    navigation.goBack();
  };

  const add = async () => {
    const [{now}] = await getNow();
    await setRepo.save({
      name,
      reps: 0,
      weight: 0,
      hidden: true,
      image: uri,
      minutes: minutes ? +minutes : 3,
      seconds: seconds ? +seconds : 30,
      sets: sets ? +sets : 3,
      steps,
      created: now,
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
    <>
      <StackHeader title="Edit workout" />
      <View style={{padding: PADDING, flex: 1}}>
        <ScrollView style={{flex: 1}}>
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
          {!!settings.showSets && (
            <MassiveInput
              innerRef={setsRef}
              value={sets}
              onChangeText={setSets}
              label="Sets per workout"
              keyboardType="numeric"
              onSubmitEditing={() => minutesRef.current?.focus()}
            />
          )}
          {!!settings.alarm && (
            <>
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
            </>
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
    </>
  );
}
