import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import {Button} from 'react-native-paper';
import {RootStackParamList} from './App';
import {getDb} from './db';

export default function Settings({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Settings'>) {
  const [minutes, setMinutes] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('');
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      setMinutes((await AsyncStorage.getItem('minutes')) || '3');
      setSeconds((await AsyncStorage.getItem('seconds')) || '');
      setAlarmEnabled((await AsyncStorage.getItem('alarmEnabled')) === 'true');
    })();
  }, [navigation]);

  useEffect(() => {
    if (minutes) AsyncStorage.setItem('minutes', minutes);
    if (seconds) AsyncStorage.setItem('seconds', seconds);
    AsyncStorage.setItem('alarmEnabled', alarmEnabled ? 'true' : 'false');
  }, [minutes, seconds, alarmEnabled]);

  const clear = async () => {
    const db = await getDb();
    await db.executeSql(`DELETE FROM sets`);
  };

  return (
    <View style={styles.container}>
      <Text>Rest minutes</Text>
      <TextInput
        value={minutes}
        keyboardType="numeric"
        placeholder="3"
        onChangeText={setMinutes}
      />
      <Text>Rest seconds</Text>
      <TextInput
        value={seconds}
        keyboardType="numeric"
        placeholder="30"
        onChangeText={setSeconds}
      />
      <Text>Alarm enabled?</Text>
      <Switch
        style={{alignSelf: 'flex-start'}}
        value={alarmEnabled}
        onValueChange={setAlarmEnabled}
      />
      <Button icon="trash" onPress={clear}>
        Clear sets
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});
