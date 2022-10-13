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
import {getSettings, updateSettings} from './settings.service';
import {useSettings} from './use-settings';

export default function EditSet() {
  const {params} = useRoute<RouteProp<HomePageParams, 'EditSet'>>();
  const {set} = params;
  const navigation = useNavigation();
  const {toast} = useContext(SnackbarContext);
  const {settings, setSettings} = useSettings();

  useFocusEffect(
    useCallback(() => {
      console.log(`${EditSet.name}.focus:`, set);
      let title = 'Create set';
      if (typeof set.id === 'number') title = 'Edit set';
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        headerRight: null,
        title,
      });
    }, [navigation, set]),
  );

  const startTimer = useCallback(
    async (value: Set) => {
      if (!settings.alarm) return;
      const milliseconds =
        Number(value.minutes) * 60 * 1000 + Number(value.seconds) * 1000;
      NativeModules.AlarmModule.timer(
        milliseconds,
        !!settings.vibrate,
        settings.sound,
      );
      const next = new Date();
      next.setTime(next.getTime() + milliseconds);
      await updateSettings({...settings, nextAlarm: next.toISOString()});
      setSettings(await getSettings());
    },
    [settings, setSettings],
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
      startTimer(value);
      await addSet(value);
      if (!settings.notify) return navigation.goBack();
      if (
        value.weight > set.weight ||
        (value.reps > set.reps && value.weight === set.weight)
      )
        toast("Great work King, that's a new record!", 3000);
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
    <View style={{padding: PADDING, flex: 1}}>
      <SetForm save={save} set={set} />
    </View>
  );
}
