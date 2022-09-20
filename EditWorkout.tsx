import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {ScrollView, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Button, Card, IconButton, TouchableRipple} from 'react-native-paper';
import ConfirmDialog from './ConfirmDialog';
import {MARGIN, PADDING} from './constants';
import MassiveInput from './MassiveInput';
import {updatePlanWorkouts} from './plan.service';
import Set from './set';
import {addSet, getSets, updateManySet, updateSetImage} from './set.service';
import Workout from './workout';
import {
  addWorkout,
  getWorkout,
  updateName,
  updateSteps,
} from './workout.service';
import {WorkoutsPageParams} from './WorkoutsPage';

export default function EditWorkout() {
  const {params} = useRoute<RouteProp<WorkoutsPageParams, 'EditWorkout'>>();
  const [name, setName] = useState(params.value.name);
  const [removeImage, setRemoveImage] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [steps, setSteps] = useState('');
  const [uri, setUri] = useState<string>();
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [sets, setSets] = useState('');
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        headerRight: null,
        title: params.value.name ? params.value.name : 'New workout',
      });
      if (!params.value.name) return;
      getSets({search: params.value.name, limit: 1, offset: 0}).then(
        ([set]) => {
          if (!set) return;
          setUri(set.image);
          setMinutes(set.minutes?.toString() ?? '3');
          setSeconds(set.seconds?.toString() ?? '30');
          setSets(set.sets?.toString() ?? '3');
        },
      );
      console.log(`${EditWorkout.name}.focus`, {params});
      getWorkout(params.value.name).then(workout => setSteps(workout.steps));
    }, [navigation, params]),
  );

  const update = async () => {
    console.log(`${EditWorkout.name}.update`, {
      params: params.value.name,
      name,
      uri,
      steps,
    });
    await updateManySet({
      oldName: params.value.name,
      newName: name || params.value.name,
      sets,
      seconds,
      minutes,
    });
    await updatePlanWorkouts(params.value.name, name || params.value.name);
    await updateName(params.value.name, name);
    if (uri || removeImage) await updateSetImage(params.value.name, uri || '');
    if (steps) await updateSteps(params.value.name, steps);
    navigation.goBack();
  };

  const add = async () => {
    await addSet({
      name,
      reps: 0,
      weight: 0,
      hidden: true,
      image: uri,
      minutes: +minutes,
      seconds: +seconds,
      sets: +sets,
    } as Set);
    addWorkout({name, steps} as Workout);
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

  return (
    <View style={{padding: PADDING}}>
      <ScrollView style={{height: '90%'}}>
        <MassiveInput label="Name" value={name} onChangeText={setName} />
        <MassiveInput
          selectTextOnFocus={false}
          value={steps}
          onChangeText={setSteps}
          label="Steps"
          multiline
        />
        <MassiveInput
          value={sets}
          onChangeText={setSets}
          label="Sets per workout"
          keyboardType="numeric"
        />
        <MassiveInput
          value={minutes}
          onChangeText={setMinutes}
          label="Rest minutes"
          keyboardType="numeric"
        />
        <MassiveInput
          value={seconds}
          onChangeText={setSeconds}
          label="Rest seconds"
          keyboardType="numeric"
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
            icon="image">
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
