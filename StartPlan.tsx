import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {NativeModules, TextInput, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {Button, IconButton, List, RadioButton} from 'react-native-paper';
import {getBestSet} from './best.service';
import {useColor} from './color';
import {PADDING} from './constants';
import CountMany from './count-many';
import MassiveInput from './MassiveInput';
import {useSnackbar} from './MassiveSnack';
import {PlanPageParams} from './plan-page-params';
import Set from './set';
import {addSet, countManyToday, getDistinctSets} from './set.service';
import SetForm from './SetForm';
import {useSettings} from './use-settings';

export default function StartPlan() {
  const {params} = useRoute<RouteProp<PlanPageParams, 'StartPlan'>>();
  const {set} = params;
  const [name, setName] = useState(set.name);
  const [reps, setReps] = useState(set.reps.toString());
  const [weight, setWeight] = useState(set.weight.toString());
  const [unit, setUnit] = useState<string>();
  const {toast} = useSnackbar();
  const [minutes, setMinutes] = useState(set.minutes);
  const [seconds, setSeconds] = useState(set.seconds);
  const [best, setBest] = useState<Set>(set);
  const [selected, setSelected] = useState(0);
  const {settings} = useSettings();
  const [counts, setCounts] = useState<CountMany[]>();
  const [distinctSets, setDistinctSets] = useState<Set[]>();
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const unitRef = useRef<TextInput>(null);
  const navigation = useNavigation();
  const workouts = useMemo(() => params.plan.workouts.split(','), [params]);
  const {color} = useColor();

  const [selection, setSelection] = useState({
    start: 0,
    end: set.reps.toString().length,
  });

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        headerRight: null,
        title: params.plan.days.replace(/,/g, ', '),
      });
      countManyToday().then(newCounts => {
        setCounts(newCounts);
        console.log(`${StartPlan.name}.focus:`, {newCounts});
      });
      getDistinctSets({limit: 100, offset: 0, search: '%'}).then(
        newDistinct => {
          setDistinctSets(newDistinct);
          console.log(`${StartPlan.name}.focus:`, {newDistinct});
        },
      );
    }, [navigation, params]),
  );

  const handleSubmit = async () => {
    console.log(`${SetForm.name}.handleSubmit:`, {reps, weight, unit, best});
    await addSet({
      name,
      weight: +weight,
      reps: +reps,
      minutes: set.minutes,
      seconds: set.seconds,
      steps: set.steps,
      image: set.image,
      unit,
    });
    countManyToday().then(setCounts);
    if (
      settings.notify &&
      (+weight > best.weight || (+reps > best.reps && +weight === best.weight))
    )
      toast("Great work King! That's a new record.", 5000);
    else if (settings.alarm) toast('Resting...', 3000);
    else toast('Added set', 3000);
    if (!settings.alarm) return;
    const milliseconds = Number(minutes) * 60 * 1000 + Number(seconds) * 1000;
    const args = [milliseconds, !!settings.vibrate, settings.sound];
    NativeModules.AlarmModule.timer(...args);
  };

  const handleUnit = useCallback(
    (value: string) => {
      setUnit(value.replace(/,|'/g, ''));
      if (value.match(/,|'/))
        toast('Commas and single quotes would break CSV exports', 6000);
    },
    [toast],
  );

  const select = useCallback(
    async (index: number) => {
      setSelected(index);
      console.log(`${StartPlan.name}.next:`, {name, workouts});
      const workout = workouts[index];
      console.log(`${StartPlan.name}.next:`, {workout});
      const newBest = await getBestSet(workout);
      setMinutes(newBest.minutes);
      setSeconds(newBest.seconds);
      setName(newBest.name);
      setReps(newBest.reps.toString());
      setWeight(newBest.weight.toString());
      setUnit(newBest.unit);
      setBest(newBest);
    },
    [name, workouts],
  );

  const getDescription = useCallback(
    (countName: string) => {
      const count = counts?.find(c => c.name === countName);
      console.log(`${StartPlan.name}:`, {count, countName});
      if (!distinctSets) return;
      const distinct = distinctSets.find(d => d.name === countName);
      console.log(`${StartPlan.name}:`, {distinct});
      if (settings.showSets) return `${count?.total || 0} / ${distinct?.sets}`;
      return count?.total || '0';
    },
    [counts, distinctSets, settings.showSets],
  );

  return (
    <View style={{padding: PADDING, flex: 1, flexDirection: 'column'}}>
      <View style={{flex: 1}}>
        <MassiveInput
          label="Reps"
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
          onSubmitEditing={() => weightRef.current?.focus()}
          selection={selection}
          onSelectionChange={e => setSelection(e.nativeEvent.selection)}
          innerRef={repsRef}
        />
        <MassiveInput
          label="Weight"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          onSubmitEditing={handleSubmit}
          innerRef={weightRef}
          blurOnSubmit
        />
        {!!settings.showUnit && (
          <MassiveInput
            autoCapitalize="none"
            label="Unit"
            value={unit}
            onChangeText={handleUnit}
            innerRef={unitRef}
          />
        )}
        <FlatList
          data={workouts}
          renderItem={({item, index}) => (
            <List.Item
              title={item}
              description={getDescription(item)}
              onPress={() => select(index)}
              left={() => (
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                  <RadioButton
                    value={index.toString()}
                    status={selected === index ? 'checked' : 'unchecked'}
                    color={color}
                  />
                </View>
              )}
            />
          )}
        />
      </View>
      <Button mode="contained" icon="save" onPress={handleSubmit}>
        Save
      </Button>
    </View>
  );
}
