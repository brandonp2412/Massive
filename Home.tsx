import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  NativeModules,
  SafeAreaView,
  StyleSheet,
  Vibration,
  View,
} from 'react-native';
import {List, TextInput} from 'react-native-paper';
import Sound from 'react-native-sound';
import Alarm from './Alarm';
import {getDb} from './db';
import EditSet from './EditSet';

import Set from './set';

const limit = 20;

export default function Home() {
  const [sets, setSets] = useState<Set[]>();
  const [id, setId] = useState<number>();
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState('');
  const navigation = useNavigation();

  const refresh = async () => {
    setRefreshing(true);
    const db = await getDb();
    const [result] = await db.executeSql(
      `SELECT * from sets WHERE name LIKE ? ORDER BY created DESC LIMIT ? OFFSET ?`,
      [`%${search}%`, limit, 0],
    );
    setRefreshing(false);
    if (!result) return setSets([]);
    setSets(result.rows.raw());
    setOffset(0);
  };

  const alarm = new Sound('argon.mp3', Sound.MAIN_BUNDLE, error => {
    if (error) throw new Error(error);
  });

  const focus = async () => {
    alarm.stop();
    Vibration.cancel();
  };

  useEffect(() => {
    refresh();
  }, [search]);

  useEffect(() => navigation.addListener('focus', focus), [navigation]);

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
    setRefreshing(true);
    const db = await getDb();
    const [result] = await db.executeSql(
      `SELECT * from sets WHERE name LIKE ? LIMIT ? OFFSET ?`,
      [`%${search}%`, limit, newOffset],
    );
    setRefreshing(false);
    if (!result) return;
    if (!sets) return;
    setSets([...sets, ...result.rows.raw()]);
    setOffset(newOffset);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput label="Search" value={search} onChangeText={setSearch} />
      <FlatList
        style={{height: '100%'}}
        data={sets}
        renderItem={renderItem}
        keyExtractor={set => set.id.toString()}
        onRefresh={refresh}
        refreshing={refreshing}
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
