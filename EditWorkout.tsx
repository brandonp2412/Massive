import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useContext, useState} from 'react';
import {BackHandler, ScrollView, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Button, Card, IconButton, TouchableRipple} from 'react-native-paper';
import ConfirmDialog from './ConfirmDialog';
import {MARGIN, PADDING} from './constants';
import {DrawerParamList} from './drawer-param-list';
import MassiveInput from './MassiveInput';
import {SnackbarContext} from './MassiveSnack';
import {updatePlanWorkouts} from './plan.service';
import {addSet, updateManySet, updateSetImage} from './set.service';
import {settings} from './settings.service';

export default function EditWorkout() {
  const {params} = useRoute<RouteProp<DrawerParamList, 'Edit workout'>>();
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
  const navigation = useNavigation<NavigationProp<DrawerParamList>>();

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerLeft: () => (
          <IconButton
            icon="arrow-back"
            onPress={() => navigation.navigate('Workouts', {})}
          />
        ),
        headerRight: null,
        title: params.value.name || 'New workout',
      });
      const onBack = () => {
        navigation.navigate('Workouts', {});
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBack);
    }, [navigation, params.value.name]),
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

  return (
    <View style={{padding: PADDING}}>
      <ScrollView style={{height: '90%'}}>
        <MassiveInput
          autoFocus
          label="Name"
          value={name}
          onChangeText={handleName}
        />
        {!!settings.steps && (
          <MassiveInput
            selectTextOnFocus={false}
            value={steps}
            onChangeText={handleSteps}
            label="Steps"
            multiline
          />
        )}
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
