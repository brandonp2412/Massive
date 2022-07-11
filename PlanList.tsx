import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {List, Searchbar} from 'react-native-paper';
import {DatabaseContext} from './App';
import MassiveFab from './MassiveFab';
import {Plan} from './plan';
import PlanItem from './PlanItem';
import {PlanPageParams} from './PlanPage';

export default function PlanList() {
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [refreshing, setRefresing] = useState(false);
  const db = useContext(DatabaseContext);
  const navigation = useNavigation<NavigationProp<PlanPageParams>>();

  const refresh = useCallback(async () => {
    const selectPlans = `
      SELECT * from plans
      WHERE days LIKE ? OR workouts LIKE ?
    `;
    const getPlans = ({s}: {s: string}) =>
      db.executeSql(selectPlans, [`%${s}%`, `%${s}%`]);
    const [plansResult] = await getPlans({s: search});
    setPlans(plansResult.rows.raw());
  }, [search, db]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    if (!search) return;
    refresh();
  }, [search, refresh]);

  const renderItem = useCallback(
    ({item}: {item: Plan}) => (
      <PlanItem item={item} key={item.id} onRemove={refresh} />
    ),
    [refresh],
  );

  return (
    <View style={styles.container}>
      <Searchbar value={search} onChangeText={setSearch} placeholder="Search" />
      <FlatList
        style={{height: '100%'}}
        data={plans}
        renderItem={renderItem}
        keyExtractor={set => set.id.toString()}
        refreshing={refreshing}
        onRefresh={() => {
          setRefresing(true);
          refresh().finally(() => setRefresing(false));
        }}
        ListEmptyComponent={
          <List.Item
            title="No plans yet"
            description="A plan is a list of workouts for certain days."
          />
        }
      />

      <MassiveFab
        onPress={() =>
          navigation.navigate('EditPlan', {
            plan: {days: '', workouts: '', id: 0},
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    paddingBottom: '10%',
  },
  progress: {
    marginTop: 10,
  },
});
