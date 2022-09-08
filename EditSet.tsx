import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {NativeModules, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {SnackbarContext} from './App';
import {HomePageParams} from './HomePage';
import Set from './set';
import {addSet, setSet} from './set.service';
import SetForm from './SetForm';
import {getSettings} from './settings.service';

export default function EditSet() {
  const {params} = useRoute<RouteProp<HomePageParams, 'EditSet'>>();
  const navigation = useNavigation();
  const {toast} = useContext(SnackbarContext);

  useFocusEffect(
    useCallback(() => {
      getSettings().then(settings => {
        let title = 'Edit set';
        if (!params.set.id && params.set.name)
          title = `Add set (${params.count} / ${settings.sets})`;
        if (!params.set.id && !params.set.name) title = 'Add set';
        navigation.getParent()?.setOptions({
          headerLeft: () => (
            <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
          ),
          headerRight: null,
          title,
        });
      });
    }, [navigation, params]),
  );

  const startTimer = useCallback(async () => {
    const settings = await getSettings();
    if (!settings.alarm) return;
    const milliseconds = settings.minutes * 60 * 1000 + settings.seconds * 1000;
    NativeModules.AlarmModule.timer(
      milliseconds,
      !!settings.vibrate,
      settings.sound,
    );
  }, []);

  const update = useCallback(
    async (set: Set) => {
      console.log(`${EditSet.name}.update`, set);
      await setSet(set);
      navigation.goBack();
    },
    [navigation],
  );

  const add = useCallback(
    async (set: Set) => {
      startTimer();
      await addSet(set);
      const settings = await getSettings();
      if (settings.notify === 0) return navigation.goBack();
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
