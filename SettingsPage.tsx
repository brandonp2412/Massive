import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {NativeModules, ScrollView, StyleSheet, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Button, Searchbar, Text} from 'react-native-paper';
import {SnackbarContext} from './App';
import ConfirmDialog from './ConfirmDialog';
import {getSettings, setSettings} from './db';
import MassiveInput from './MassiveInput';
import MassiveSwitch from './MassiveSwitch';

export default function SettingsPage() {
  const [vibrate, setVibrate] = useState(true);
  const [minutes, setMinutes] = useState<string>('');
  const [sets, setMaxSets] = useState<string>('3');
  const [seconds, setSeconds] = useState<string>('');
  const [alarm, setAlarm] = useState(false);
  const [predict, setPredict] = useState(false);
  const [sound, setSound] = useState<string>('');
  const [notify, setNotify] = useState(false);
  const [images, setImages] = useState(false);
  const [battery, setBattery] = useState(false);
  const [ignoring, setIgnoring] = useState(false);
  const [search, setSearch] = useState('');
  const {toast} = useContext(SnackbarContext);

  const refresh = useCallback(async () => {
    const settings = await getSettings();
    console.log('SettingsPage.refresh:', {settings});
    setMinutes(settings.minutes.toString());
    setSeconds(settings.seconds.toString());
    setAlarm(!!settings.alarm);
    setPredict(!!settings.predict);
    setMaxSets(settings.sets.toString());
    setVibrate(!!settings.vibrate);
    setSound(settings.sound);
    setNotify(!!settings.notify);
    setImages(!!settings.images);
    NativeModules.AlarmModule.ignoringBattery(setIgnoring);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setSettings({
      vibrate: +vibrate,
      minutes: +minutes,
      seconds: +seconds,
      alarm: +alarm,
      predict: +predict,
      sound,
      notify: +notify,
      images: +images,
      sets: +sets,
    });
  }, [vibrate, minutes, sets, seconds, alarm, predict, sound, notify, images]);

  const changeAlarmEnabled = useCallback(
    (enabled: boolean) => {
      setAlarm(enabled);
      toast('Time your rest duration after each set.', 4000);
      if (enabled && !ignoring) setBattery(true);
    },
    [setBattery, ignoring, toast],
  );

  const changePredict = useCallback(
    (enabled: boolean) => {
      setPredict(enabled);
      toast('Predict your next set based on todays plan.', 4000);
    },
    [setPredict, toast],
  );

  const changeVibrate = useCallback(
    (value: boolean) => {
      setVibrate(value);
      toast('When a timer completes, vibrate your phone.', 4000);
    },
    [setVibrate, toast],
  );

  const changeSound = useCallback(async () => {
    const {fileCopyUri} = await DocumentPicker.pickSingle({
      type: 'audio/*',
      copyTo: 'documentDirectory',
    });
    if (fileCopyUri) setSound(fileCopyUri);
  }, []);

  const changeNotify = useCallback(
    (value: boolean) => {
      setNotify(value);
      toast('If a set is a new record, show a notification.', 4000);
    },
    [toast],
  );

  const items: {name: string; element: ReactNode}[] = [
    {
      name: 'Sets per workout',
      element: (
        <MassiveInput
          label="Sets per workout"
          value={sets}
          keyboardType="numeric"
          onChangeText={value => {
            setMaxSets(value);
          }}
        />
      ),
    },
    {
      name: 'Rest minutes Rest seconds',
      element: (
        <View style={{flexDirection: 'row', marginBottom: 10}}>
          <MassiveInput
            style={{width: 125, marginRight: 10}}
            label="Rest minutes"
            value={minutes}
            keyboardType="numeric"
            placeholder="3"
            onChangeText={text => {
              setMinutes(text);
            }}
          />
          <MassiveInput
            style={{width: 125}}
            label="Rest seconds"
            value={seconds}
            keyboardType="numeric"
            placeholder="30"
            onChangeText={s => {
              setSeconds(s);
            }}
          />
        </View>
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
      name: 'Predict sets',
      element: (
        <>
          <Text style={styles.text}>Predict sets</Text>
          <MassiveSwitch
            style={[styles.text, {alignSelf: 'flex-start'}]}
            value={predict}
            onValueChange={changePredict}
          />
        </>
      ),
    },
    {
      name: 'Record notifications',
      element: (
        <>
          <Text style={styles.text}>Record notifications</Text>
          <MassiveSwitch
            style={[styles.text, {alignSelf: 'flex-start'}]}
            value={notify}
            onValueChange={changeNotify}
          />
        </>
      ),
    },
    {
      name: 'Show images',
      element: (
        <>
          <Text style={styles.text}>Show images</Text>
          <MassiveSwitch
            style={[styles.text, {alignSelf: 'flex-start'}]}
            value={images}
            onValueChange={setImages}
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
      <ScrollView>
        {items
          .filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map(item => (
            <React.Fragment key={item.name}>{item.element}</React.Fragment>
          ))}
      </ScrollView>
      <ConfirmDialog
        title="Battery optimizations"
        show={battery}
        setShow={setBattery}
        onOk={() => {
          NativeModules.AlarmModule.ignoreBattery();
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
