import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {NativeModules, View} from 'react-native';
import {PADDING} from './constants';
import {HomePageParams} from './home-page-params';
import {useSnackbar} from './MassiveSnack';
import Set from './set';
import {addSet, getSet, updateSet} from './set.service';
import SetForm from './SetForm';
import StackHeader from './StackHeader';
import {useSettings} from './use-settings';

export default function EditSet() {
  const {params} = useRoute<RouteProp<HomePageParams, 'EditSet'>>();
  const {set} = params;
  const navigation = useNavigation();
  const {toast} = useSnackbar();
  const {settings} = useSettings();

  const startTimer = useCallback(
    async (name: string) => {
      if (!settings.alarm) return;
      const {minutes, seconds} = await getSet(name);
      const milliseconds = (minutes ?? 3) * 60 * 1000 + (seconds ?? 0) * 1000;
      NativeModules.AlarmModule.timer(
        milliseconds,
        !!settings.vibrate,
        settings.sound,
        !!settings.noSound,
      );
    },
    [settings],
  );

  const update = useCallback(
    async (value: Set) => {
      console.log(`${EditSet.name}.update`, value);
      await updateSet(value);
      navigation.goBack();
    },
    [navigation],
  );

  const add = useCallback(
    async (value: Set) => {
      console.log(`${EditSet.name}.add`, {set: value});
      startTimer(value.name);
      await addSet(value);
      if (!settings.notify) return navigation.goBack();
      if (
        value.weight > set.weight ||
        (value.reps > set.reps && value.weight === set.weight)
      )
        toast("Great work King! That's a new record.", 3000);
      navigation.goBack();
    },
    [navigation, startTimer, set, toast, settings],
  );

  const save = useCallback(
    async (value: Set) => {
      if (typeof set.id === 'number') return update(value);
      return add(value);
    },
    [update, add, set.id],
  );

  return (
    <>
      <StackHeader title="Edit set" />
      <View style={{padding: PADDING, flex: 1}}>
        <SetForm save={save} set={set} />
      </View>
    </>
  );
}
