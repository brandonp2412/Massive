import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  NativeModules,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {Searchbar, TextInput} from 'react-native-paper';
import {DatabaseContext} from './App';
import ConfirmDialog from './ConfirmDialog';
import MassiveSwitch from './MassiveSwitch';
import Settings from './settings';

export default function SettingsPage() {
  const [vibrate, setVibrate] = useState(true);
  const [minutes, setMinutes] = useState<string>('');
  const [maxSets, setMaxSets] = useState<string>('3');
  const [seconds, setSeconds] = useState<string>('');
  const [alarm, setAlarm] = useState<boolean>(false);
  const [predictive, setPredictive] = useState<boolean>(false);
  const [battery, setBattery] = useState(false);
  const [ignoring, setIgnoring] = useState(false);
  const [search, setSearch] = useState('');
  const db = useContext(DatabaseContext);

  const refresh = useCallback(async () => {
    const [result] = await db.executeSql(`SELECT * FROM settings LIMIT 1`);
    const settings: Settings = result.rows.item(0);
    console.log('SettingsPage.refresh:', {settings});
    setMinutes(settings.minutes.toString());
    setSeconds(settings.seconds.toString());
    setAlarm(!!settings.alarm);
    setPredictive(!!settings.predict);
    setMaxSets(settings.sets.toString());
    setVibrate(!!settings.vibrate);
    NativeModules.AlarmModule.ignoringBattery(setIgnoring);
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    db.executeSql(
      `UPDATE settings SET vibrate=?,minutes=?,sets=?,seconds=?,alarm=?,predict=?`,
      [vibrate, minutes, maxSets, seconds, alarm, predictive],
    );
  }, [vibrate, minutes, maxSets, seconds, alarm, predictive, db]);

  const changeAlarmEnabled = useCallback(
    (enabled: boolean) => {
      setAlarm(enabled);
      if (enabled && !ignoring) setBattery(true);
    },
    [setBattery, ignoring],
  );

  const changePredictive = useCallback(
    (enabled: boolean) => {
      setPredictive(enabled);
      ToastAndroid.show(
        'Predictive sets guess whats next based on todays plan.',
        ToastAndroid.LONG,
      );
    },
    [setPredictive],
  );

  const changeVibrate = useCallback(
    (value: boolean) => {
      setVibrate(value);
    },
    [setVibrate],
  );

  const items: {name: string; element: ReactNode}[] = [
    {
      name: 'Sets per workout',
      element: (
        <TextInput
          label="Sets per workout"
          value={maxSets}
          keyboardType="numeric"
          onChangeText={value => {
            setMaxSets(value);
          }}
          style={styles.text}
          selectTextOnFocus
        />
      ),
    },
    {
      name: 'Rest seconds',
      element: (
        <TextInput
          label="Rest seconds"
          value={seconds}
          keyboardType="numeric"
          placeholder="30"
          onChangeText={s => {
            setSeconds(s);
          }}
          style={styles.text}
          selectTextOnFocus
        />
      ),
    },
    {
      name: 'Rest minutes',
      element: (
        <TextInput
          label="Rest minutes"
          value={minutes}
          keyboardType="numeric"
          placeholder="3"
          onChangeText={text => {
            setMinutes(text);
          }}
          style={styles.text}
          selectTextOnFocus
        />
      ),
    },
    {
      name: 'Rest timers',
      element: (
        <>
          <Text style={styles.text}>Rest timers</Text>
          <MassiveSwitch
            style={[styles.text, {alignSelf: 'flex-start'}]}
            value={alarm}
            onValueChange={changeAlarmEnabled}
          />
        </>
      ),
    },
    {
      name: 'Vibrate',
      element: (
        <>
          <Text style={styles.text}>Vibrate</Text>
          <MassiveSwitch
            style={[styles.text, {alignSelf: 'flex-start'}]}
            value={vibrate}
            onValueChange={changeVibrate}
          />
        </>
      ),
    },
    {
      name: 'Predictive sets',
      element: (
        <>
          <Text style={styles.text}>Predictive sets</Text>
          <MassiveSwitch
            style={[styles.text, {alignSelf: 'flex-start'}]}
            value={predictive}
            onValueChange={changePredictive}
          />
        </>
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <Searchbar
        style={{marginBottom: 10}}
        placeholder="Search"
        value={search}
        onChangeText={setSearch}
      />
      {items
        .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
        .map(item => (
          <React.Fragment key={item.name}>{item.element}</React.Fragment>
        ))}
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
