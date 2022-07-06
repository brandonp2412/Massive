import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  NativeModules,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {AnimatedFAB, Searchbar} from 'react-native-paper';
import {getSets} from './db';
import EditSet from './EditSet';

import Set from './set';
import SetItem from './SetItem';

const limit = 20;

export default function Home() {
  const [sets, setSets] = useState<Set[]>();
  const [id, setId] = useState<number>();
  const [offset, setOffset] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState('');
  const [refreshing, setRefresing] = useState(false);
  const navigation = useNavigation();

  const refresh = async () => {
    setRefresing(true);
    const [result] = await getSets({search, limit, offset: 0}).finally(() =>
      setRefresing(false),
    );
    if (!result) return setSets([]);
    setSets(result.rows.raw());
    setOffset(0);
  };

  useEffect(() => {
    refresh();
  }, [search]);

  useEffect(() => navigation.addListener('focus', refresh), [navigation]);

  const renderItem = ({item}: {item: Set}) => (
    <SetItem
      item={item}
      key={item.id}
      setShowEdit={setShowEdit}
      setId={setId}
      onRemove={refresh}
    />
  );

  const save = async () => {
    refresh();
    const enabled = await AsyncStorage.getItem('alarmEnabled');
    if (enabled !== 'true') return;
    const minutes = await AsyncStorage.getItem('minutes');
    const seconds = await AsyncStorage.getItem('seconds');
    const milliseconds = Number(minutes) * 60 * 1000 + Number(seconds) * 1000;
    NativeModules.AlarmModule.timer(milliseconds);
  };

  const next = async () => {
    setRefresing(true);
    const newOffset = offset + limit;
    const [result] = await getSets({search, limit, offset: newOffset}).finally(
      () => setRefresing(false),
    );
    if (result.rows.length === 0) return;
    if (!sets) return;
    setSets([...sets, ...result.rows.raw()]);
    setOffset(newOffset);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar placeholder="Search" value={search} onChangeText={setSearch} />
      <FlatList
        style={{height: '90%'}}
        data={sets}
        renderItem={renderItem}
        keyExtractor={set => set.id.toString()}
        onEndReached={next}
        refreshing={refreshing}
        onRefresh={refresh}
      />
      <EditSet
        clearId={() => setId(undefined)}
        id={id}
        show={showEdit}
        setShow={setShowEdit}
        onSave={save}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 18,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  bottom: {
    alignSelf: 'center',
    flexDirection: 'row',
  },
});
