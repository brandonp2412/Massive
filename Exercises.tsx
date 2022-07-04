import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {List, TextInput} from 'react-native-paper';
import {RootStackParamList} from './App';
import {getDb} from './db';
import Exercise from './exercise';

export default function Exercises({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Exercises'>) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const refresh = async () => {
    setRefreshing(true);
    const db = await getDb();
    const [result] = await db.executeSql(
      `SELECT name, reps, unit, MAX(weight) AS weight 
      FROM sets
      WHERE name LIKE ?
      GROUP BY name;`,
      [`%${search}%`],
    );
    setRefreshing(false);
    if (!result) return setExercises([]);
    setExercises(result.rows.raw());
  };

  useEffect(() => navigation.addListener('focus', refresh), [navigation]);
  useEffect(() => {
    refresh();
  }, [search]);

  const renderItem = ({item}: {item: Exercise}) => (
    <List.Item
      key={item.name}
      title={item.name}
      description={`Best: ${item.reps} x ${item.weight}${item.unit}`}
    />
  );

  return (
    <View style={styles.container}>
      <TextInput label="Search" value={search} onChangeText={setSearch} />
      <FlatList
        onRefresh={refresh}
        refreshing={refreshing}
        renderItem={renderItem}
        data={exercises}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});
