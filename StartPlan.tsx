import {RouteProp, useFocusEffect, useRoute} from '@react-navigation/native';
import {useCallback, useMemo, useRef, useState} from 'react';
import {NativeModules, TextInput, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {Button} from 'react-native-paper';
import {getBestSet} from './best.service';
import {PADDING} from './constants';
import CountMany from './count-many';
import {AppDataSource} from './data-source';
import {getNow, setRepo} from './db';
import GymSet from './gym-set';
import MassiveInput from './MassiveInput';
import {useSnackbar} from './MassiveSnack';
import {PlanPageParams} from './plan-page-params';
import SetForm from './SetForm';
import StackHeader from './StackHeader';
import StartPlanItem from './StartPlanItem';
import {useSettings} from './use-settings';

export default function StartPlan() {
  const {params} = useRoute<RouteProp<PlanPageParams, 'StartPlan'>>();
  const [name, setName] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<string>('kg');
  const {toast} = useSnackbar();
  const [minutes, setMinutes] = useState(3);
  const [seconds, setSeconds] = useState(30);
  const [best, setBest] = useState<GymSet>();
  const [selected, setSelected] = useState(0);
  const {settings} = useSettings();
  const [counts, setCounts] = useState<CountMany[]>();
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const unitRef = useRef<TextInput>(null);
  const workouts = useMemo(() => params.plan.workouts.split(','), [params]);

  const [selection, setSelection] = useState({
    start: 0,
    end: 0,
  });

  const refresh = useCallback(() => {
    const questions = workouts
      .map((workout, index) => `('${workout}',${index})`)
      .join(',');
    console.log({questions, workouts});
    const select = `
      SELECT workouts.name, COUNT(sets.id) as total
      FROM (select 0 as name, 0 as sequence union values ${questions}) as workouts 
      LEFT JOIN sets ON sets.name = workouts.name 
        AND sets.created LIKE STRFTIME('%Y-%m-%d%%', 'now', 'localtime')
        AND NOT sets.hidden
      GROUP BY workouts.name
      ORDER BY workouts.sequence
      LIMIT -1
      OFFSET 1
    `;
    return AppDataSource.manager.query(select).then(newCounts => {
      setCounts(newCounts);
      console.log(`${StartPlan.name}.focus:`, {newCounts});
      return newCounts;
    });
  }, [workouts]);

  const select = useCallback(
    async (index: number, newCounts?: CountMany[]) => {
      setSelected(index);
      console.log(`${StartPlan.name}.next:`, {name, index});
      if (!counts && !newCounts) return;
      const workout = counts ? counts[index] : newCounts[index];
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

  useFocusEffect(
    useCallback(() => {
      refresh().then(newCounts => select(0, newCounts));
    }, [refresh]),
  );

  const handleSubmit = async () => {
    console.log(`${SetForm.name}.handleSubmit:`, {reps, weight, unit, best});
    const [{now}] = await getNow();
    await setRepo.save({
      name,
      weight: +weight,
      reps: +reps,
      unit,
      created: now,
      minutes,
      seconds,
      sets: best.sets,
      hidden: false,
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
