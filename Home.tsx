import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  NativeModules,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import {Button, List} from 'react-native-paper';
import Sound from 'react-native-sound';
import Alarm from './Alarm';
import {RootStackParamList} from './App';
import {getDb} from './db';
import EditSet from './EditSet';

import Set from './Set';

const limit = 20;

export default function Home({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const [sets, setSets] = useState<Set[]>();
  const [id, setId] = useState<number>();
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState('');

  const refresh = async () => {
    setRefreshing(true);
    const db = await getDb();
    const [result] = await db.executeSql(
      `SELECT * from sets WHERE name LIKE ? LIMIT ? OFFSET ?`,
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
    console.log({enabled});
    if (enabled !== 'true') return;
    const minutes = await AsyncStorage.getItem('minutes');
    const seconds = await AsyncStorage.getItem('seconds');
    const milliseconds = Number(minutes) * 60 * 1000 + Number(seconds) * 1000;
    const when = new Date();
    when.setTime(when.getTime() + milliseconds);
    NativeModules.AlarmModule.timer(milliseconds);
    await AsyncStorage.setItem('nextAlarm', when.toISOString());
  };

  const close = () => {
    alarm.stop();
    Vibration.cancel();
    setShowTimer(false);
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
      <TextInput placeholder="Search" value={search} onChangeText={setSearch} />
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
        <View style={styles.button}></View>
        <View style={styles.button}>
          <Button icon="time" onPress={() => setShowTimer(true)}>
            Time left
          </Button>
        </View>
        <View style={styles.button}>
          <Button icon="stop" onPress={close}>
            Stop
          </Button>
        </View>
        <View style={styles.button}>
          <EditSet
            id={id}
            setId={setId}
            show={showEdit}
            setShow={setShowEdit}
            onSave={save}
          />
        </View>
      </View>
      {showTimer && <Alarm onClose={close} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 18,
  },
  button: {
    marginRight: 10,
  },
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
  },
  bottom: {
    alignSelf: 'center',
    marginBottom: 10,
    flexDirection: 'row',
  },
  set: {
    marginBottom: 10,
    fontSize: 18,
    shadowColor: 'red',
    shadowRadius: 10,
    shadowOffset: {width: 2, height: 40},
    shadowOpacity: 8,
  },
});
