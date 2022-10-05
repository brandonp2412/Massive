import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {NativeModules, TextInput, View} from 'react-native';
import {Button, Chip, IconButton} from 'react-native-paper';
import {getBestSet} from './best.service';
import {MARGIN, PADDING} from './constants';
import CountMany from './count-many';
import MassiveInput from './MassiveInput';
import {SnackbarContext} from './MassiveSnack';
import {SessionPageParams} from './session-page-params';
import {addSet, countManyToday} from './set.service';
import SetForm from './SetForm';
import {useSettings} from './use-settings';

export default function StartSession() {
  const {params} = useRoute<RouteProp<SessionPageParams, 'StartSession'>>();
  const {set} = params;
  const [name, setName] = useState(set.name);
  const [reps, setReps] = useState(set.reps.toString());
  const [weight, setWeight] = useState(set.weight.toString());
  const [unit, setUnit] = useState<string>();
  const {toast} = useContext(SnackbarContext);
  const [minutes, setMinutes] = useState(set.minutes);
  const [seconds, setSeconds] = useState(set.seconds);
  const {settings} = useSettings();
  const [counts, setCounts] = useState<CountMany[]>();
  const [selection, setSelection] = useState({
    start: 0,
    end: set.reps.toString().length,
  });
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const unitRef = useRef<TextInput>(null);
  const navigation = useNavigation();
  const workouts = useMemo(() => params.plan.workouts.split(','), [params]);

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        headerRight: null,
        title: params.plan.days.replace(/,/g, ', '),
      });
      countManyToday().then(setCounts);
    }, [navigation, params]),
  );

  const handleSubmit = async () => {
    console.log(`${SetForm.name}.handleSubmit:`, {reps, weight, unit});
    await addSet({
      name,
      weight: +weight,
      reps: +reps,
      minutes: set.minutes,
      seconds: set.seconds,
      steps: set.steps,
      unit,
    });
    countManyToday().then(setCounts);
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
      console.log(`${StartSession.name}.next:`, {name, workouts});
      const workout = workouts[index];
      console.log(`${StartSession.name}.next:`, {workout});
      const best = await getBestSet(workout);
      console.log(`${StartSession.name}.next:`, {best});
      setMinutes(best.minutes);
      setSeconds(best.seconds);
      setName(best.name);
      setReps(best.reps.toString());
      setWeight(best.weight.toString());
      setUnit(best.unit);
    },
    [name, workouts],
  );

  return (
    <View style={{padding: PADDING}}>
      <MassiveInput
        label="Reps"
        keyboardType="numeric"
        value={reps}
        onChangeText={setReps}
        onSubmitEditing={() => weightRef.current?.focus()}
        selection={selection}
        onSelectionChange={e => setSelection(e.nativeEvent.selection)}
        autoFocus
        innerRef={repsRef}
      />
      <MassiveInput
        label="Weight"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        onSubmitEditing={handleSubmit}
        innerRef={weightRef}
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
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        {workouts.map((workout, index) => (
          <Chip
            key={workout}
            selected={workout === name}
            icon="fitness-center"
            onPress={() => select(index)}
            style={{marginBottom: MARGIN, marginRight: MARGIN}}>
            {workout} x
            {counts?.find(count => count.name === workout)?.total || 0}
          </Chip>
        ))}
      </View>
      <Button mode="contained" icon="save" onPress={handleSubmit}>
        Save
      </Button>
    </View>
  );
}
