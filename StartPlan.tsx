import {RouteProp, useFocusEffect, useRoute} from '@react-navigation/native';
import {useCallback, useMemo, useRef, useState} from 'react';
import {NativeModules, TextInput, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {Button} from 'react-native-paper';
import {getBestSet} from './best.service';
import {PADDING} from './constants';
import CountMany from './count-many';
import {AppDataSource, getNow, setRepo} from './db';
import GymSet from './gym-set';
import MassiveInput from './MassiveInput';
import {useSnackbar} from './MassiveSnack';
import {PlanPageParams} from './plan-page-params';
import {countMany} from './set.service';
import SetForm from './SetForm';
import StackHeader from './StackHeader';
import StartPlanItem from './StartPlanItem';
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
  const [best, setBest] = useState<GymSet>(set);
  const [selected, setSelected] = useState(0);
  const {settings} = useSettings();
  const [counts, setCounts] = useState<CountMany[]>();
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const unitRef = useRef<TextInput>(null);
  const workouts = useMemo(() => params.plan.workouts.split(','), [params]);

  const [selection, setSelection] = useState({
    start: 0,
    end: set.reps.toString().length,
  });

  const refresh = useCallback(() => {
    const questions = workouts.map(_ => '(?)').join(',');
    const condition = `
      sets.name = workouts.name
        AND sets.created LIKE STRFTIME('%Y-%m-%d%%', 'now', 'localtime')
        AND NOT sets.hidden
    `;
    return AppDataSource.manager
      .createQueryBuilder()
      .select('COUNT(sets.id)', 'total')
      .addSelect('workouts')
      .from(`(SELECT 0 AS name UNION values ${questions})`, 'workouts')
      .leftJoin('sets', condition)
      .groupBy('workouts.name')
      .limit(-1)
      .offset(1)
      .getRawMany()
      .then(newCounts => {
        setCounts(newCounts);
        console.log(`${StartPlan.name}.focus:`, {newCounts});
      });
  }, [workouts]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleSubmit = async () => {
    console.log(`${SetForm.name}.handleSubmit:`, {reps, weight, unit, best});
    const [{now}] = await getNow();
    await setRepo.save({
      name,
      weight: +weight,
      reps: +reps,
      minutes: set.minutes,
      seconds: set.seconds,
      steps: set.steps,
      image: set.image,
      unit,
      created: now,
    });
    await refresh();
    if (
      settings.notify &&
      (+weight > best.weight || (+reps > best.reps && +weight === best.weight))
    )
      toast("Great work King! That's a new record.", 5000);
    else if (settings.alarm) toast('Resting...', 3000);
    else toast('Added set', 3000);
    if (!settings.alarm) return;
    const milliseconds = Number(minutes) * 60 * 1000 + Number(seconds) * 1000;
    const {vibrate, sound, noSound} = settings;
    const args = [milliseconds, !!vibrate, sound, !!noSound];
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
      console.log(`${StartPlan.name}.next:`, {name, index});
      if (!counts) return;
      const workout = counts[index];
      console.log(`${StartPlan.name}.next:`, {workout});
      const newBest = await getBestSet(workout.name);
      console.log(`${StartPlan.name}.next:`, {newBest});
      setMinutes(newBest.minutes);
      setSeconds(newBest.seconds);
      setName(newBest.name);
      setReps(newBest.reps.toString());
      setWeight(newBest.weight.toString());
      setUnit(newBest.unit);
      setBest(newBest);
    },
    [name, counts],
  );

  return (
    <>
      <StackHeader title={params.plan.days.replace(/,/g, ', ')} />
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
          {counts && (
            <FlatList
              data={counts}
              renderItem={props => (
                <StartPlanItem
                  {...props}
                  onUndo={refresh}
                  onSelect={select}
                  selected={selected}
                />
              )}
            />
          )}
        </View>
        <Button mode="contained" icon="save" onPress={handleSubmit}>
          Save
        </Button>
      </View>
    </>
  );
}
