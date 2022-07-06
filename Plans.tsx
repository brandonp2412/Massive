import React, {useEffect, useState} from 'react';
import {FlatList, View} from 'react-native';
import {AnimatedFAB, Searchbar} from 'react-native-paper';
import {getPlans} from './db';
import EditPlan from './EditPlan';
import {Plan} from './plan';
import PlanItem from './PlanItem';

export default function Plans() {
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [refreshing, setRefresing] = useState(false);
  const [id, setId] = useState<number>();
  const [showEdit, setShowEdit] = useState(false);

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
      setId={setId}
      onRemove={refresh}
    />
  );

  return (
    <View style={{padding: 10}}>
      <Searchbar value={search} onChangeText={setSearch} placeholder="Search" />
      <FlatList
        style={{height: '90%'}}
        data={plans}
        renderItem={renderItem}
        keyExtractor={set => set.id.toString()}
        refreshing={refreshing}
        onRefresh={refresh}
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
