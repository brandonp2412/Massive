import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {NativeModules, StyleSheet, Text, View} from 'react-native';
import {Button, Snackbar, Switch, TextInput} from 'react-native-paper';
import {RootStackParamList} from './App';
import {getDb} from './db';
import BatteryDialog from './BatteryDialog';

export default function Settings({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Settings'>) {
  const [minutes, setMinutes] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('');
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState('');
  const [showBattery, setShowBattery] = useState(false);

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
    setSnackbar('Deleting all data...');
    setTimeout(() => setSnackbar(''), 5000);
    const db = await getDb();
    await db.executeSql(`DELETE FROM sets`);
  };

  const exportSets = () => {
    NativeModules.ExportModule.sets();
  };

  const importSets = () => {
    NativeModules.ImportModule.sets();
  };

  const changeAlarmEnabled = (enabled: boolean) => {
    if (!enabled) return setAlarmEnabled(enabled);
    NativeModules.AlarmModule.ignoringBatteryOptimizations(
      (ignoring: boolean) => {
        if (ignoring) return setAlarmEnabled(true);
        setShowBattery(true);
      },
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Rest minutes"
        value={minutes}
        keyboardType="numeric"
        placeholder="3"
        onChangeText={setMinutes}
        style={styles.text}
      />
      <TextInput
        label="Rest seconds"
        value={seconds}
        keyboardType="numeric"
        placeholder="30"
        onChangeText={setSeconds}
        style={styles.text}
      />
      <Text style={styles.text}>Alarm enabled?</Text>
      <Switch
        style={[styles.text, {alignSelf: 'flex-start'}]}
        value={alarmEnabled}
        onValueChange={changeAlarmEnabled}
      />
      <Button
        style={{alignSelf: 'flex-start'}}
        icon="arrow-down"
        onPress={exportSets}>
        Export
      </Button>
      <Button
        style={{alignSelf: 'flex-start'}}
        icon="arrow-up"
        onPress={importSets}>
        Import
      </Button>
      <Button
        style={{alignSelf: 'flex-start', marginTop: 'auto'}}
        icon="trash"
        onPress={clear}>
        Delete all data
      </Button>

      <BatteryDialog show={showBattery} setShow={setShowBattery} />

      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        action={{label: 'Close', onPress: () => setSnackbar('')}}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
  },
  text: {
    marginBottom: 10,
  },
});
