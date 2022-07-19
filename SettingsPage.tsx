import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useEffect, useState} from 'react';
import {
  NativeModules,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {TextInput} from 'react-native-paper';
import ConfirmDialog from './ConfirmDialog';
import MassiveSwitch from './MassiveSwitch';

const {getItem, setItem} = AsyncStorage;

export default function SettingsPage() {
  const [minutes, setMinutes] = useState<string>('');
  const [maxSets, setMaxSets] = useState<string>('3');
  const [seconds, setSeconds] = useState<string>('');
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(false);
  const [predictiveSets, setPredictiveSets] = useState<boolean>(false);
  const [showBattery, setShowBattery] = useState(false);
  const [ignoring, setIgnoring] = useState(false);

  const refresh = useCallback(async () => {
    setMinutes((await getItem('minutes')) || '');
    setSeconds((await getItem('seconds')) || '');
    setAlarmEnabled((await getItem('alarmEnabled')) === 'true');
    setPredictiveSets((await getItem('predictiveSets')) === 'true');
    setMaxSets((await getItem('maxSets')) || '');
    NativeModules.AlarmModule.ignoringBatteryOptimizations(setIgnoring);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
      ToastAndroid.show(
        'Predictive sets guess whats next based on todays plan.',
        ToastAndroid.LONG,
      );
    },
    [setPredictiveSets],
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

      <TextInput
        label="Max sets"
        value={maxSets}
        keyboardType="numeric"
        onChangeText={value => {
          setMaxSets(value);
          setItem('maxSets', value);
        }}
        style={styles.text}
      />

      <Text style={styles.text}>Rest timers</Text>
      <MassiveSwitch
        style={[styles.text, {alignSelf: 'flex-start'}]}
        value={alarmEnabled}
        onValueChange={changeAlarmEnabled}
      />

      <ConfirmDialog
        title="Battery optimizations"
        show={showBattery}
        setShow={setShowBattery}
        onOk={() => {
          NativeModules.AlarmModule.openBatteryOptimizations();
          setShowBattery(false);
        }}>
        Disable battery optimizations for Massive to use rest timers.
      </ConfirmDialog>

      <Text style={styles.text}>Predictive sets</Text>
      <MassiveSwitch
        style={[styles.text, {alignSelf: 'flex-start'}]}
        value={predictiveSets}
        onValueChange={changePredictive}
      />
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
