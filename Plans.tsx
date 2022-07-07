import {useFocusEffect} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {AnimatedFAB, ProgressBar, Searchbar} from 'react-native-paper';
import {getPlans, getProgress} from './db';
import EditPlan from './EditPlan';
import {Plan} from './plan';
import PlanItem from './PlanItem';
import Progress from './progress';

export default function Plans() {
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [refreshing, setRefresing] = useState(false);
  const [id, setId] = useState<number>();
  const [showEdit, setShowEdit] = useState(false);
  const [progresses, setProgresses] = useState<Progress[]>([]);
  const today = `%${format(new Date(new Date().toUTCString()), 'EEEE')}%`;
  const now = `${format(new Date(new Date().toUTCString()), 'yyyy-MM-dd')}%`;

  const refresh = async () => {
    const [plansResult] = await getPlans({search});
    setPlans(plansResult.rows.raw());
    const [todaysResult] = await getPlans({search: today});
    if (todaysResult.rows.length === 0) return;
    const workouts: string[] = todaysResult.rows.item(0).workouts.split(',');
    const newProgress: Progress[] = [];
    for (const workout of workouts) {
      const [workoutResult] = await getProgress({
        created: now,
        name: workout,
      });
      newProgress.push({name: workout, sets: workoutResult.rows.item(0).count});
    }
    setProgresses(newProgress);
  };

  useFocusEffect(() => {
    refresh();
  });

  useEffect(() => {
    refresh();
  }, [search]);

  const renderItem = ({item}: {item: Plan}) => (
    <PlanItem
      item={item}
      key={item.id}
      setShowEdit={setShowEdit}
      setId={setId}
      onRemove={refresh}
    />
  );

  return (
    <View style={styles.container}>
      <Searchbar value={search} onChangeText={setSearch} placeholder="Search" />
      {progresses.map(progress => (
        <React.Fragment key={progress.name}>
          <Text style={styles.progress}>{progress.name}</Text>
          <ProgressBar progress={progress.sets / 3} />
        </React.Fragment>
      ))}

      <FlatList
        data={plans}
        renderItem={renderItem}
        keyExtractor={set => set.id.toString()}
        refreshing={refreshing}
        onRefresh={() => {
          setRefresing(true);
          refresh().finally(() => setRefresing(false));
        }}
      />

      <EditPlan
        clearId={() => setId(undefined)}
        onSave={refresh}
        setShow={setShowEdit}
        show={showEdit}
        id={id}
      />

      <AnimatedFAB
        extended={false}
        label="Add"
        icon="add"
        style={{position: 'absolute', right: 20, bottom: 20}}
        onPress={() => {
          setId(undefined);
          setShowEdit(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
  },
  progress: {
    marginTop: 10,
  },
});
