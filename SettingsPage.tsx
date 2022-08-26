import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {NativeModules, StyleSheet, Text, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Button, Searchbar} from 'react-native-paper';
import {DatabaseContext, SnackbarContext} from './App';
import ConfirmDialog from './ConfirmDialog';
import MassiveInput from './MassiveInput';
import MassiveSwitch from './MassiveSwitch';
import Settings from './settings';

export default function SettingsPage() {
  const [vibrate, setVibrate] = useState(true);
  const [minutes, setMinutes] = useState<string>('');
  const [maxSets, setMaxSets] = useState<string>('3');
  const [seconds, setSeconds] = useState<string>('');
  const [alarm, setAlarm] = useState<boolean>(false);
  const [predictive, setPredictive] = useState<boolean>(false);
  const [sound, setSound] = useState<string>('');
  const [battery, setBattery] = useState(false);
  const [ignoring, setIgnoring] = useState(false);
  const [search, setSearch] = useState('');
  const db = useContext(DatabaseContext);
  const {toast} = useContext(SnackbarContext);

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
    setSound(settings.sound);
    NativeModules.AlarmModule.ignoringBattery(setIgnoring);
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    db.executeSql(
      `UPDATE settings SET vibrate=?,minutes=?,sets=?,seconds=?,alarm=?,predict=?,sound=?`,
      [vibrate, minutes, maxSets, seconds, alarm, predictive, sound],
    );
  }, [vibrate, minutes, maxSets, seconds, alarm, predictive, sound, db]);

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
      toast('Predictive sets guess whats next based on todays plan.', 7000);
    },
    [setPredictive, toast],
  );

  const changeVibrate = useCallback(
    (value: boolean) => {
      setVibrate(value);
    },
    [setVibrate],
  );

  const changeSound = useCallback(async () => {
    const {fileCopyUri} = await DocumentPicker.pickSingle({
      type: 'audio/*',
      copyTo: 'documentDirectory',
    });
    if (fileCopyUri) setSound(fileCopyUri);
  }, []);

  const items: {name: string; element: ReactNode}[] = [
    {
      name: 'Sets per workout',
      element: (
        <MassiveInput
          label="Sets per workout"
          value={maxSets}
          keyboardType="numeric"
          onChangeText={value => {
            setMaxSets(value);
          }}
        />
      ),
    },
    {
      name: 'Rest minutes',
      element: (
        <MassiveInput
          label="Rest minutes"
          value={minutes}
          keyboardType="numeric"
          placeholder="3"
          onChangeText={text => {
            setMinutes(text);
          }}
        />
      ),
    },
    {
      name: 'Rest seconds',
      element: (
        <MassiveInput
          label="Rest seconds"
          value={seconds}
          keyboardType="numeric"
          placeholder="30"
          onChangeText={s => {
            setSeconds(s);
          }}
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
    {
      name: 'Alarm sound',
      element: (
        <Button onPress={changeSound}>
          Alarm sound
          {sound ? ': ' + sound.split('/')[sound.split('/').length - 1] : null}
        </Button>
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
