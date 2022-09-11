import React, {useCallback, useContext, useEffect, useState} from 'react';
import {NativeModules, ScrollView, StyleSheet, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Button, Searchbar, Text} from 'react-native-paper';
import ConfirmDialog from './ConfirmDialog';
import MassiveInput from './MassiveInput';
import {SnackbarContext} from './MassiveSnack';
import MassiveSwitch from './MassiveSwitch';
import {getSettings, setSettings} from './settings.service';

interface Input<T> {
  name: string;
  value?: T;
  onChange: (value: T) => void;
}

export default function SettingsPage() {
  const [vibrate, setVibrate] = useState(true);
  const [minutes, setMinutes] = useState<string>('');
  const [sets, setSets] = useState<string>('3');
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
    setSets(settings.sets.toString());
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
      if (enabled) toast('Timers will now run after each set.', 4000);
      else toast('Stopped timers running after each set.', 4000);
      if (enabled && !ignoring) setBattery(true);
    },
    [setBattery, ignoring, toast],
  );

  const changePredict = useCallback(
    (enabled: boolean) => {
      setPredict(enabled);
      if (enabled)
        toast('Predicting your next set based on todays plan.', 4000);
      else toast('New sets will always be empty.', 4000);
    },
    [setPredict, toast],
  );

  const changeVibrate = useCallback(
    (enabled: boolean) => {
      setVibrate(enabled);
      if (enabled) toast('When a timer completes, vibrate your phone.', 4000);
      else toast('Stop vibrating at the end of timers.', 4000);
    },
    [setVibrate, toast],
  );

  const changeSound = useCallback(async () => {
    const {fileCopyUri} = await DocumentPicker.pickSingle({
      type: 'audio/*',
      copyTo: 'documentDirectory',
    });
    if (!fileCopyUri) return;
    setSound(fileCopyUri);
    toast('This song will now play after rest timers complete.', 4000);
  }, [toast]);

  const changeNotify = useCallback(
    (enabled: boolean) => {
      setNotify(enabled);
      if (enabled) toast('Show when a set is a new record.', 4000);
      else toast('Stopped showing notifications for new records.', 4000);
    },
    [toast],
  );

  const inputs: Input<string>[] = [
    {name: 'Sets per workout', value: sets, onChange: setSets},
    {name: 'Rest minutes', value: minutes, onChange: setMinutes},
    {name: 'Rest seconds', value: seconds, onChange: setSeconds},
  ];

  const switches: Input<boolean>[] = [
    {name: 'Rest timers', value: alarm, onChange: changeAlarmEnabled},
    {name: 'Vibrate', value: vibrate, onChange: changeVibrate},
    {name: 'Predict sets', value: predict, onChange: changePredict},
    {name: 'Record notifications', value: notify, onChange: changeNotify},
    {name: 'Show images', value: images, onChange: setImages},
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
        {inputs
          .filter(input =>
            input.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map(input => (
            <MassiveInput
              key={input.name}
              label={input.name}
              value={input.value}
              keyboardType="numeric"
              onChangeText={input.onChange}
            />
          ))}
        {switches
          .filter(input =>
            input.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map(input => (
            <React.Fragment key={input.name}>
              <Text style={styles.text}>{input.name}</Text>
              <MassiveSwitch
                style={[styles.text, {alignSelf: 'flex-start'}]}
                value={input.value}
                onValueChange={input.onChange}
              />
            </React.Fragment>
          ))}
        {'alarm sound'.includes(search.toLowerCase()) && (
          <Button onPress={changeSound}>
            Alarm sound
            {sound
              ? ': ' + sound.split('/')[sound.split('/').length - 1]
              : null}
          </Button>
        )}
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
