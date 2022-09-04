import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {Image, ScrollView, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Button, IconButton} from 'react-native-paper';
import {set} from 'react-native-reanimated';
import {db} from './db';
import MassiveInput from './MassiveInput';
import {WorkoutsPageParams} from './WorkoutsPage';

export default function EditWorkout() {
  const [name, setName] = useState('');
  const [uri, setUri] = useState('');
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
      db.executeSql(`SELECT image FROM sets WHERE name = ? LIMIT 1`, [
        params.value.name,
      ]).then(([result]) => setUri(result.rows.item(0)?.image));
    }, [navigation, params.value.name]),
  );

  const update = useCallback(async () => {
    console.log(`${EditWorkout.name}.update`, set);
    if (name) {
      await db.executeSql(`UPDATE sets SET name = ? WHERE name = ?`, [
        name,
        params.value.name,
      ]);
      await db.executeSql(
        `UPDATE plans SET workouts = REPLACE(workouts, ?, ?) 
      WHERE workouts LIKE ?`,
        [params.value.name, name, `%${params.value.name}%`],
      );
    }
    if (uri)
      await db.executeSql(`UPDATE sets SET image = ? WHERE name = ?`, [
        uri,
        params.value.name,
      ]);
    navigation.goBack();
  }, [navigation, params.value.name, name, uri]);

  const add = useCallback(async () => {
    const insert = `
        INSERT INTO sets(name, reps, weight, created, unit, hidden) 
        VALUES (?,0,0,strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime'),'kg',true)
      `;
    await db.executeSql(insert, [name]);
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
    <ScrollView style={{padding: 10, height: '90%'}}>
      {params.value.name ? (
        <>
          <MassiveInput
            placeholder={params.value.name}
            label="New name"
            value={name}
            onChangeText={setName}
          />
          <View style={{flexDirection: 'row', paddingBottom: 10}}>
            {uri && <Image source={{uri}} style={{height: 75, width: 75}} />}
            <Button onPress={changeImage} icon="image">
              Image
            </Button>
          </View>
        </>
      ) : (
        <MassiveInput label="Name" value={name} onChangeText={setName} />
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
