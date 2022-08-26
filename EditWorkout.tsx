import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useContext, useState} from 'react';
import {ScrollView} from 'react-native';
import {Button, IconButton} from 'react-native-paper';
import {set} from 'react-native-reanimated';
import {DatabaseContext} from './App';
import MassiveInput from './MassiveInput';
import {WorkoutsPageParams} from './WorkoutsPage';

export default function EditWorkout() {
  const [name, setName] = useState('');
  const {params} = useRoute<RouteProp<WorkoutsPageParams, 'EditWorkout'>>();
  const db = useContext(DatabaseContext);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        headerRight: null,
        title: params.value.name ? 'Edit workout' : 'New workout',
      });
    }, [navigation, params.value.name]),
  );

  const update = useCallback(async () => {
    console.log(`${EditWorkout.name}.update`, set);
    await db.executeSql(`UPDATE sets SET name = ? WHERE name = ?`, [
      name,
      params.value.name,
    ]);
    await db.executeSql(
      `UPDATE plans SET workouts = REPLACE(workouts, ?, ?) 
      WHERE workouts LIKE ?`,
      [params.value.name, name, `%${params.value.name}%`],
    );
    navigation.goBack();
  }, [db, navigation, params.value.name, name]);

  const add = useCallback(async () => {
    const insert = `
        INSERT INTO sets(name, reps, weight, created, unit, hidden) 
        VALUES (?,0,0,strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime'),'kg',true)
      `;
    await db.executeSql(insert, [name]);
    navigation.goBack();
  }, [db, navigation, name]);

  const save = useCallback(async () => {
    if (params.value.name) return update();
    return add();
  }, [update, add, params.value.name]);

  return (
    <ScrollView style={{padding: 10, height: '90%'}}>
      {params.value.name ? (
        <>
          <MassiveInput label="Old name" value={params.value.name} disabled />
          <MassiveInput label="New name" value={name} onChangeText={setName} />
        </>
      ) : (
        <MassiveInput label="Name" value={name} onChangeText={setName} />
      )}
      <Button
        disabled={!name && !!params.value.name}
        mode="contained"
        icon="save"
        onPress={save}>
        Save
      </Button>
    </ScrollView>
  );
}
