import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {NativeModules, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {PADDING} from './constants';
import {HomePageParams} from './home-page-params';
import {SnackbarContext} from './MassiveSnack';
import Set from './set';
import {addSet, updateSet} from './set.service';
import SetForm from './SetForm';
import {settings} from './settings.service';

export default function EditSet() {
  const {params} = useRoute<RouteProp<HomePageParams, 'EditSet'>>();
  const navigation = useNavigation();
  const {toast} = useContext(SnackbarContext);

  useFocusEffect(
    useCallback(() => {
      console.log(`${EditSet.name}.focus:`, params);
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        headerRight: null,
        title: typeof params.set.id === 'number' ? 'Edit set' : 'Create set',
      });
    }, [navigation, params]),
  );

  const startTimer = useCallback(async (set: Set) => {
    if (!settings.alarm) return;
    const milliseconds =
      Number(set.minutes) * 60 * 1000 + Number(set.seconds) * 1000;
    NativeModules.AlarmModule.timer(
      milliseconds,
      !!settings.vibrate,
      settings.sound,
    );
  }, []);

  const update = useCallback(
    async (set: Set) => {
      console.log(`${EditSet.name}.update`, set);
      await updateSet(set);
      navigation.goBack();
    },
    [navigation],
  );

  const add = useCallback(
    async (set: Set) => {
      console.log(`${EditSet.name}.add`, {set});
      startTimer(set);
      await addSet(set);
      if (!settings.notify) return navigation.goBack();
      if (
        set.weight > params.set.weight ||
        (set.reps > params.set.reps && set.weight === params.set.weight)
      )
        toast("Great work King, that's a new record!", 3000);
      navigation.goBack();
    },
    [navigation, startTimer, params.set, toast],
  );

  const save = useCallback(
    async (set: Set) => {
      if (typeof params.set.id === 'number') return update(set);
      return add(set);
    },
    [update, add, params.set.id],
  );

  return (
    <View style={{padding: PADDING}}>
      <SetForm save={save} set={params.set} workouts={params.workouts} />
    </View>
  );
}
