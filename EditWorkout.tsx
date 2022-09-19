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
import {updateWorkouts} from './plan.service';
import Set from './set';
import {addSet, getSets, updateSetImage, updateSetName} from './set.service';
import Workout from './workout';
import {addWorkout, getWorkout, updateSteps} from './workout.service';
import {WorkoutsPageParams} from './WorkoutsPage';

export default function EditWorkout() {
  const [name, setName] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [steps, setSteps] = useState('');
  const [uri, setUri] = useState<string>();
  const {params} = useRoute<RouteProp<WorkoutsPageParams, 'EditWorkout'>>();
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
      getSets({search: params.value.name, limit: 1, offset: 0}).then(sets =>
        setUri(sets[0]?.image),
      );
      getWorkout(params.value.name).then(workout => setSteps(workout.steps));
    }, [navigation, params.value.name]),
  );

  const update = useCallback(async () => {
    console.log(`${EditWorkout.name}.update`, {
      params: params.value.name,
      name,
      uri,
      steps,
    });
    if (name) {
      await updateSetName(params.value.name, name);
      await updateWorkouts(params.value.name, name);
    }
    if (uri || removeImage) await updateSetImage(params.value.name, uri || '');
    if (steps) await updateSteps(params.value.name, steps);
    navigation.goBack();
  }, [navigation, params.value.name, name, uri, steps, removeImage]);

  const add = useCallback(async () => {
    await addSet({name, reps: 0, weight: 0, hidden: true, image: uri} as Set);
    await addWorkout({name, steps} as Workout);
    navigation.goBack();
  }, [navigation, name, steps, uri]);

  const save = useCallback(async () => {
    if (params.value.name) return update();
    return add();
  }, [update, add, params.value.name]);

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
        <MassiveInput
          label={params.value.name || 'Name'}
          value={name}
          onChangeText={setName}
        />
        <MassiveInput
          selectTextOnFocus={false}
          value={steps}
          onChangeText={setSteps}
          label="Steps"
          multiline
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
      <Button mode="contained" icon="save" onPress={save}>
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
