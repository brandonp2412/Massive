import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useContext, useEffect, useState} from 'react';
import {NativeModules, StyleSheet, Text, View} from 'react-native';
import {Button, Snackbar, Switch, TextInput} from 'react-native-paper';
import {DatabaseContext} from './App';
import BatteryDialog from './BatteryDialog';

const {getItem, setItem} = AsyncStorage;

export default function SettingsPage() {
  const [minutes, setMinutes] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('');
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState('');
  const [showBattery, setShowBattery] = useState(false);
  const [ignoring, setIgnoring] = useState(false);
  const db = useContext(DatabaseContext);

  const refresh = async () => {
    setMinutes((await getItem('minutes')) || '');
    setSeconds((await getItem('seconds')) || '');
    setAlarmEnabled((await getItem('alarmEnabled')) === 'true');
    NativeModules.AlarmModule.ignoringBatteryOptimizations(setIgnoring);
  };

  useEffect(() => {
    refresh();
  }, []);

  const clear = async () => {
    setSnackbar('Deleting all data...');
    setTimeout(() => setSnackbar(''), 5000);
    await db.executeSql(`DELETE FROM sets`);
  };

  const exportSets = () => {
    NativeModules.ExportModule.sets();
  };

  const importSets = () => {
    NativeModules.ImportModule.sets();
  };

  const changeAlarmEnabled = (enabled: boolean) => {
    setAlarmEnabled(enabled);
    if (enabled && !ignoring) setShowBattery(true);
    setItem('alarmEnabled', enabled ? 'true' : 'false');
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Rest minutes"
        value={minutes}
        keyboardType="numeric"
        placeholder="3"
        onChangeText={text => {
          setMinutes(text);
          setItem('minutes', text);
        }}
        style={styles.text}
      />
      <TextInput
        label="Rest seconds"
        value={seconds}
        keyboardType="numeric"
        placeholder="30"
        onChangeText={seconds => {
          setSeconds(seconds);
          setItem('seconds', seconds);
        }}
        style={styles.text}
      />
      <Text style={styles.text}>Rest timers</Text>
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
