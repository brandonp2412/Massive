import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  NativeModules,
  PermissionsAndroid,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Dirs, FileSystem} from 'react-native-file-access';
import {Button, Snackbar, Switch, TextInput} from 'react-native-paper';
import {DatabaseContext} from './App';
import BatteryDialog from './BatteryDialog';
import Set from './set';
import DocumentPicker from 'react-native-document-picker';

const {getItem, setItem} = AsyncStorage;

export default function SettingsPage() {
  const [minutes, setMinutes] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('');
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(false);
  const [predictiveSets, setPredictiveSets] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState('');
  const [showBattery, setShowBattery] = useState(false);
  const [ignoring, setIgnoring] = useState(false);
  const [timeoutId, setTimeoutId] = useState(0);
  const db = useContext(DatabaseContext);

  const refresh = useCallback(async () => {
    setMinutes((await getItem('minutes')) || '');
    setSeconds((await getItem('seconds')) || '');
    setAlarmEnabled((await getItem('alarmEnabled')) === 'true');
    NativeModules.AlarmModule.ignoringBatteryOptimizations(setIgnoring);
  }, [setIgnoring]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toast = useCallback(
    (message: string, timeout = 3000) => {
      setSnackbar(message);
      clearTimeout(timeoutId);
      setTimeoutId(setTimeout(() => setSnackbar(''), timeout));
    },
    [setSnackbar, timeoutId, setTimeoutId],
  );

  const clear = useCallback(async () => {
    await db.executeSql(`DELETE FROM sets`);
    toast('All data has been deleted!');
  }, [db, toast]);

  const exportSets = useCallback(async () => {
    const fileName = 'sets.csv';
    const filePath = `${Dirs.DocumentDir}/${fileName}`;
    const [result] = await db.executeSql('SELECT * FROM sets');
    if (result.rows.length === 0) return;
    const sets: Set[] = result.rows.raw();
    const data = ['id,name,reps,weight,created,unit']
      .concat(
        sets.map(
          set =>
            `${set.id},${set.name},${set.reps},${set.weight},${set.created},${set.unit}`,
        ),
      )
      .join('\n');
    console.log('SettingsPage.exportSets', {length: sets.length});
    const permission = async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    };
    const granted = await permission();
    if (granted) {
      await FileSystem.writeFile(filePath, data);
      if (!FileSystem.exists(filePath)) return;
      await FileSystem.cpExternal(filePath, fileName, 'downloads');
    }
    toast('Exported data. Check your downloads folder.');
  }, [db, toast]);

  const importSets = useCallback(async () => {
    const result = await DocumentPicker.pickSingle();
    const file = await FileSystem.readFile(result.uri);
    console.log(`${SettingsPage.name}.${importSets.name}:`, file.length);
    const values = file
      .split('\n')
      .slice(1)
      .map(set => {
        const cells = set.split(',');
        return `('${cells[1]}',${cells[2]},${cells[3]},'${cells[4]}','${cells[5]}')`;
      })
      .join(',');
    await db.executeSql(
      `INSERT INTO sets(name,reps,weight,created,unit) VALUES ${values}`,
    );
    toast('Data imported.');
  }, [db, toast]);

  const changeAlarmEnabled = useCallback(
    (enabled: boolean) => {
      setAlarmEnabled(enabled);
      if (enabled && !ignoring) setShowBattery(true);
      setItem('alarmEnabled', enabled ? 'true' : 'false');
    },
    [setShowBattery, ignoring],
  );

  const changePredictive = useCallback(
    (enabled: boolean) => {
      setPredictiveSets(enabled);
      setItem('predictiveSets', enabled ? 'true' : 'false');
      toast('Predictive sets guess whats next based on todays plan.', 10000);
    },
    [setPredictiveSets, toast],
  );

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
        onChangeText={s => {
          setSeconds(s);
          setItem('seconds', s);
        }}
        style={styles.text}
      />

      <Text style={styles.text}>Rest timers</Text>
      <Switch
        style={[styles.text, {alignSelf: 'flex-start'}]}
        value={alarmEnabled}
        onValueChange={changeAlarmEnabled}
      />

      <Text style={styles.text}>Predictive sets</Text>
      <Switch
        style={[styles.text, {alignSelf: 'flex-start'}]}
        value={predictiveSets}
        onValueChange={changePredictive}
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
