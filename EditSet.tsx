import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {NativeModules, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {DatabaseContext, SnackbarContext} from './App';
import {HomePageParams} from './HomePage';
import Set from './set';
import SetForm from './SetForm';
import Settings from './settings';

export default function EditSet() {
  const {params} = useRoute<RouteProp<HomePageParams, 'EditSet'>>();
  const db = useContext(DatabaseContext);
  const navigation = useNavigation();
  const {toast} = useContext(SnackbarContext);

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        headerRight: null,
        title: 'Set',
      });
    }, [navigation]),
  );

  const startTimer = useCallback(async () => {
    const [result] = await db.executeSql(`SELECT * FROM settings LIMIT 1`);
    const settings: Settings = result.rows.item(0);
    if (!settings.alarm) return;
    const milliseconds = settings.minutes * 60 * 1000 + settings.seconds * 1000;
    NativeModules.AlarmModule.timer(milliseconds, !!settings.vibrate);
  }, [db]);

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
      const {name, reps, weight, unit} = set;
      const insert = `
        INSERT INTO sets(name, reps, weight, created, unit) 
        VALUES (?,?,?,strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime'),?)
      `;
      startTimer();
      await db.executeSql(insert, [name, reps, weight, unit]);
      if (
        weight > params.set.weight ||
        (reps > params.set.reps && weight === params.set.weight)
      )
        toast("Great work King, that's a new record!", 6000);
      navigation.goBack();
    },
    [db, navigation, startTimer, params.set, toast],
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
      <SetForm save={save} set={params.set} workouts={params.workouts} />
    </View>
  );
}
