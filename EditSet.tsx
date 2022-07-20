import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {NativeModules, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {DatabaseContext} from './App';
import {HomePageParams} from './HomePage';
import Set from './set';
import SetForm from './SetForm';

export default function EditSet() {
  const {params} = useRoute<RouteProp<HomePageParams, 'EditSet'>>();
  const db = useContext(DatabaseContext);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        title: 'Set',
      });
    }, [navigation]),
  );

  const notify = useCallback(async () => {
    const enabled = await AsyncStorage.getItem('alarmEnabled');
    if (enabled !== 'true') return;
    const minutes = await AsyncStorage.getItem('minutes');
    const seconds = await AsyncStorage.getItem('seconds');
    const milliseconds = Number(minutes) * 60 * 1000 + Number(seconds) * 1000;
    NativeModules.AlarmModule.timer(milliseconds);
  }, []);

  const update = useCallback(
    async (set: Set) => {
      console.log(`${EditSet.name}.update`, set);
      await db.executeSql(
        `UPDATE sets SET name = ?, reps = ?, weight = ?, created = ?, unit = ? WHERE id = ?`,
        [set.name, set.reps, set.weight, set.created, set.unit, set.id],
      );
      navigation.goBack();
    },
    [db, navigation],
  );

  const add = useCallback(
    async (set: Set) => {
      const {name, reps, weight, created, unit} = set;
      const insert = `
        INSERT INTO sets(name, reps, weight, created, unit) 
        VALUES (?,?,?,?,?)
      `;
      await db.executeSql(insert, [name, reps, weight, created, unit]);
      notify();
      navigation.goBack();
    },
    [db, navigation, notify],
  );

  const save = useCallback(
    async (set: Set) => {
      if (params.set.id) return update(set);
      return add(set);
    },
    [update, add, params.set.id],
  );

  return (
    <View style={{padding: 10}}>
      <SetForm save={save} set={params.set} />
    </View>
  );
}
