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
  const [vibrate, setVibrate] = useState(true);
  const [minutes, setMinutes] = useState<string>('');
  const [maxSets, setMaxSets] = useState<string>('3');
  const [seconds, setSeconds] = useState<string>('');
  const [alarm, setAlarm] = useState<boolean>(false);
  const [predictive, setPredictive] = useState<boolean>(false);
  const [battery, setBattery] = useState(false);
  const [ignoring, setIgnoring] = useState(false);

  const refresh = useCallback(async () => {
    setMinutes((await getItem('minutes')) || '');
    setSeconds((await getItem('seconds')) || '');
    setAlarm((await getItem('alarmEnabled')) === 'true');
    setPredictive((await getItem('predictiveSets')) === 'true');
    setMaxSets((await getItem('maxSets')) || '');
    NativeModules.AlarmModule.ignoringBattery(setIgnoring);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const changeAlarmEnabled = useCallback(
    (enabled: boolean) => {
      setAlarm(enabled);
      if (enabled && !ignoring) setBattery(true);
      setItem('alarmEnabled', enabled ? 'true' : 'false');
    },
    [setBattery, ignoring],
  );

  const changePredictive = useCallback(
    (enabled: boolean) => {
      setPredictive(enabled);
      setItem('predictiveSets', enabled ? 'true' : 'false');
      ToastAndroid.show(
        'Predictive sets guess whats next based on todays plan.',
        ToastAndroid.LONG,
      );
    },
    [setPredictive],
  );

  const textInputs = (
    <>
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
        selectTextOnFocus
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
        selectTextOnFocus
      />
      <TextInput
        label="Sets per workout"
        value={maxSets}
        keyboardType="numeric"
        onChangeText={value => {
          setMaxSets(value);
          setItem('maxSets', value);
        }}
        style={styles.text}
        selectTextOnFocus
      />
    </>
  );

  const changeVibrate = useCallback(
    (value: boolean) => {
      setVibrate(value);
      setItem('vibrate', value ? 'true' : 'false');
    },
    [setVibrate],
  );

  return (
    <View style={styles.container}>
      {textInputs}
      <Text style={styles.text}>Rest timers</Text>
      <MassiveSwitch
        style={[styles.text, {alignSelf: 'flex-start'}]}
        value={alarm}
        onValueChange={changeAlarmEnabled}
      />
      <Text style={styles.text}>Vibrate</Text>
      <MassiveSwitch
        style={[styles.text, {alignSelf: 'flex-start'}]}
        value={vibrate}
        onValueChange={changeVibrate}
      />
      <ConfirmDialog
        title="Battery optimizations"
        show={battery}
        setShow={setBattery}
        onOk={() => {
          NativeModules.AlarmModule.openSettings();
          setBattery(false);
        }}>
        Disable battery optimizations for Massive to use rest timers.
      </ConfirmDialog>
      <Text style={styles.text}>Predictive sets</Text>
      <MassiveSwitch
        style={[styles.text, {alignSelf: 'flex-start'}]}
        value={predictive}
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
