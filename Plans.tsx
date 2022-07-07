import React, {useContext, useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {AnimatedFAB, List, Searchbar} from 'react-native-paper';
import {DatabaseContext} from './App';
import EditPlan from './EditPlan';
import {Plan} from './plan';
import PlanItem from './PlanItem';

export default function Plans() {
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [refreshing, setRefresing] = useState(false);
  const [plan, setPlan] = useState<Plan>();
  const [showEdit, setShowEdit] = useState(false);
  const db = useContext(DatabaseContext);

  const selectPlans = `
    SELECT * from plans
    WHERE days LIKE ? OR workouts LIKE ?
`;
  const getPlans = ({search}: {search: string}) =>
    db.executeSql(selectPlans, [`%${search}%`, `%${search}%`]);

  const refresh = async () => {
    const [plansResult] = await getPlans({search});
    setPlans(plansResult.rows.raw());
  };

  useEffect(() => {
    refresh();
  }, [search]);

  const renderItem = ({item}: {item: Plan}) => (
    <PlanItem
      item={item}
      key={item.id}
      setShowEdit={setShowEdit}
      setPlan={setPlan}
      onRemove={refresh}
    />
  );

  return (
    <View style={styles.container}>
      <Searchbar value={search} onChangeText={setSearch} placeholder="Search" />
      <FlatList
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

      <EditPlan
        onSave={refresh}
        setShow={setShowEdit}
        show={showEdit}
        plan={plan}
      />

      <AnimatedFAB
        extended={false}
        label="Add"
        icon="add"
        style={{position: 'absolute', right: 20, bottom: 20}}
        onPress={() => {
          setPlan(undefined);
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
