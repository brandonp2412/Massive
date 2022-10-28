import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {useCallback, useState} from 'react';
import {FlatList} from 'react-native';
import {List} from 'react-native-paper';
import DrawerHeader from './DrawerHeader';
import Page from './Page';
import Set from './set';
import {getDistinctSets} from './set.service';
import SetList from './SetList';
import WorkoutItem from './WorkoutItem';
import {WorkoutsPageParams} from './WorkoutsPage';

const limit = 15;

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<Set[]>();
  const [offset, setOffset] = useState(0);
  const [term, setTerm] = useState('');
  const [end, setEnd] = useState(false);
  const navigation = useNavigation<NavigationProp<WorkoutsPageParams>>();

  const refresh = useCallback(async (value: string) => {
    const newWorkouts = await getDistinctSets({
      term: `%${value}%`,
      limit,
      offset: 0,
    });
    console.log(`${WorkoutList.name}`, {newWorkout: newWorkouts[0]});
    setWorkouts(newWorkouts);
    setOffset(0);
    setEnd(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh(term);
    }, [refresh, term]),
  );

  const renderItem = useCallback(
    ({item}: {item: Set}) => (
      <WorkoutItem
        item={item}
        key={item.name}
        onRemoved={() => refresh(term)}
      />
    ),
    [refresh, term],
  );

  const next = useCallback(async () => {
    if (end) return;
    const newOffset = offset + limit;
    console.log(`${SetList.name}.next:`, {
      offset,
      limit,
      newOffset,
      term,
    });
    const newWorkouts = await getDistinctSets({
      term: `%${term}%`,
      limit,
      offset: newOffset,
    });
    if (newWorkouts.length === 0) return setEnd(true);
    if (!workouts) return;
    setWorkouts([...workouts, ...newWorkouts]);
    if (newWorkouts.length < limit) return setEnd(true);
    setOffset(newOffset);
  }, [term, end, offset, workouts]);

  const onAdd = useCallback(async () => {
    navigation.navigate('EditWorkout', {
      value: {name: '', sets: 3, image: '', steps: '', reps: 0, weight: 0},
    });
  }, [navigation]);

  const search = useCallback(
    (value: string) => {
      setTerm(value);
      refresh(value);
    },
    [refresh],
  );

  return (
    <>
      <DrawerHeader name="Workouts" />
      <Page onAdd={onAdd} term={term} search={search}>
        {workouts?.length === 0 ? (
          <List.Item
            title="No workouts yet."
            description="A workout is something you do at the gym. For example Deadlifts are a workout."
          />
        ) : (
          <FlatList
            data={workouts}
            style={{flex: 1}}
            renderItem={renderItem}
            keyExtractor={w => w.name}
            onEndReached={next}
          />
        )}
      </Page>
    </>
  );
}
