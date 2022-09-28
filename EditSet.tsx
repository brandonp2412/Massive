import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {NativeModules, View} from 'react-native';
import {PADDING} from './constants';
import {DrawerParamList} from './drawer-param-list';
import {SnackbarContext} from './MassiveSnack';
import Set from './set';
import {addSet, updateSet} from './set.service';
import SetForm from './SetForm';
import {getSettings, settings, updateSettings} from './settings.service';

export default function EditSet() {
  const {params} = useRoute<RouteProp<DrawerParamList, 'Edit set'>>();
  const {set, count, workouts} = params;
  const navigation = useNavigation();
  const {toast} = useContext(SnackbarContext);

  useFocusEffect(
    useCallback(() => {
      console.log(`${EditSet.name}.focus:`, set);
      let title = 'Create set';
      if (typeof set.id === 'number') title = 'Edit set';
      else if (Number(set.sets) > 0)
        title = `${set.name} (${count + 1} / ${set.sets})`;
      navigation.setOptions({
        title,
      });
    }, [navigation, set, count]),
  );

  const startTimer = useCallback(async (_set: Set) => {
    if (!settings.alarm) return;
    const milliseconds =
      Number(_set.minutes) * 60 * 1000 + Number(_set.seconds) * 1000;
    NativeModules.AlarmModule.timer(
      milliseconds,
      !!settings.vibrate,
      settings.sound,
    );
    const next = new Date();
    next.setTime(next.getTime() + milliseconds);
    await updateSettings({...settings, nextAlarm: next.toISOString()});
    await getSettings();
  }, []);

  const update = useCallback(
    async (_set: Set) => {
      console.log(`${EditSet.name}.update`, _set);
      await updateSet(_set);
      navigation.goBack();
    },
    [navigation],
  );

  const add = useCallback(
    async (_set: Set) => {
      console.log(`${EditSet.name}.add`, {set: _set});
      startTimer(_set);
      await addSet(_set);
      if (!settings.notify) return navigation.goBack();
      if (
        _set.weight > set.weight ||
        (_set.reps > set.reps && _set.weight === set.weight)
      )
        toast("Great work King, that's a new record!", 3000);
      navigation.goBack();
    },
    [navigation, startTimer, set, toast],
  );

  const save = useCallback(
    async (_set: Set) => {
      if (typeof set.id === 'number') return update(_set);
      return add(_set);
    },
    [update, add, set.id],
  );

  return (
    <View style={{padding: PADDING}}>
      <SetForm save={save} set={set} workouts={workouts} />
    </View>
  );
}
