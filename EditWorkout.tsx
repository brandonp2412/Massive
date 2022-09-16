import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {Pressable, ScrollView} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Button, Card, IconButton} from 'react-native-paper';
import {MARGIN, PADDING} from './constants';
import MassiveInput from './MassiveInput';
import {updateWorkouts} from './plan.service';
import Set from './set';
import {addSet, getSets, updateSetImage, updateSetName} from './set.service';
import {WorkoutsPageParams} from './WorkoutsPage';

export default function EditWorkout() {
  const [name, setName] = useState('');
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
      if (params.value.name)
        getSets({search: params.value.name, limit: 1, offset: 0}).then(sets =>
          setUri(sets[0]?.image),
        );
    }, [navigation, params.value.name]),
  );

  const update = useCallback(async () => {
    console.log(`${EditWorkout.name}.update`, {
      params: params.value.name,
      name,
      uri,
    });
    if (name) {
      await updateSetName(params.value.name, name);
      await updateWorkouts(params.value.name, name);
    }
    if (uri) await updateSetImage(params.value.name, uri);
    navigation.goBack();
  }, [navigation, params.value.name, name, uri]);

  const add = useCallback(async () => {
    await addSet({name, reps: 0, weight: 0, hidden: true} as Set);
    navigation.goBack();
  }, [navigation, name]);

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

  return (
    <ScrollView style={{padding: PADDING}}>
      <MassiveInput
        label={params.value.name}
        value={name}
        onChangeText={setName}
      />
      {uri ? (
        <Pressable style={{marginBottom: MARGIN}} onPress={changeImage}>
          <Card.Cover source={{uri}} />
        </Pressable>
      ) : (
        <Button
          style={{marginBottom: MARGIN}}
          onPress={changeImage}
          icon="image">
          Image
        </Button>
      )}
      <Button
        disabled={!name && !!params.value.name && !uri}
        mode="contained"
        icon="save"
        onPress={save}>
        Save
      </Button>
    </ScrollView>
  );
}
