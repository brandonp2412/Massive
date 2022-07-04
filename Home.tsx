import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  NativeModules,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {List, Searchbar} from 'react-native-paper';
import Alarm from './Alarm';
import {getDb} from './db';
import EditSet from './EditSet';

import Set from './set';

const limit = 20;

export default function Home() {
  const [sets, setSets] = useState<Set[]>();
  const [id, setId] = useState<number>();
  const [offset, setOffset] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState('');

  const refresh = async () => {
    const db = await getDb();
    const [result] = await db.executeSql(
      `SELECT * from sets WHERE name LIKE ? ORDER BY created DESC LIMIT ? OFFSET ?`,
      [`%${search}%`, limit, 0],
    );
    if (!result) return setSets([]);
    setSets(result.rows.raw());
    setOffset(0);
  };

  useEffect(() => {
    refresh();
  }, [search]);

  const renderItem = ({item}: {item: Set}) => (
    <List.Item
      onPress={() => {
        setId(item.id);
        setShowEdit(true);
      }}
      key={item.id}
      title={item.name}
      description={`${item.reps} x ${item.weight}${item.unit}`}
    />
  );

  const save = async () => {
    refresh();
    const enabled = await AsyncStorage.getItem('alarmEnabled');
    if (enabled !== 'true') return;
    const minutes = await AsyncStorage.getItem('minutes');
    const seconds = await AsyncStorage.getItem('seconds');
    const milliseconds = Number(minutes) * 60 * 1000 + Number(seconds) * 1000;
    const when = new Date();
    when.setTime(when.getTime() + milliseconds);
    NativeModules.AlarmModule.timer(milliseconds);
    await AsyncStorage.setItem('nextAlarm', when.toISOString());
  };

  const next = async () => {
    const newOffset = offset + limit;
    const db = await getDb();
    const [result] = await db.executeSql(
      `SELECT * from sets WHERE name LIKE ? LIMIT ? OFFSET ?`,
      [`%${search}%`, limit, newOffset],
    );
    if (!result) return;
    if (!sets) return;
    setSets([...sets, ...result.rows.raw()]);
    setOffset(newOffset);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar placeholder="Search" value={search} onChangeText={setSearch} />
      <FlatList
        style={{height: '100%'}}
        data={sets}
        renderItem={renderItem}
        keyExtractor={set => set.id.toString()}
        onScrollEndDrag={next}
      />
      <View style={styles.bottom}>
        <Alarm />
        <EditSet
          id={id}
          setId={setId}
          show={showEdit}
          setShow={setShowEdit}
          onSave={save}
        />
      </View>
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
