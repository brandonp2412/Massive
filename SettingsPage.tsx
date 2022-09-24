import {Picker} from '@react-native-picker/picker';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {NativeModules, ScrollView, StyleSheet} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Button, Text} from 'react-native-paper';
import {CustomTheme} from './App';
import ConfirmDialog from './ConfirmDialog';
import {MARGIN} from './constants';
import {SnackbarContext} from './MassiveSnack';
import MassiveSwitch from './MassiveSwitch';
import Page from './Page';
import {getSettings, settings, updateSettings} from './settings.service';

interface Input<T> {
  name: string;
  value?: T;
  onChange: (value: T) => void;
}

export default function SettingsPage() {
  const [battery, setBattery] = useState(false);
  const [ignoring, setIgnoring] = useState(false);
  const [search, setSearch] = useState('');
  const [vibrate, setVibrate] = useState(!!settings.vibrate);
  const [alarm, setAlarm] = useState(!!settings.alarm);
  const [predict, setPredict] = useState(!!settings.predict);
  const [sound, setSound] = useState(settings.sound);
  const [notify, setNotify] = useState(!!settings.notify);
  const [images, setImages] = useState(!!settings.images);
  const [showUnit, setShowUnit] = useState(!!settings.showUnit);
  const {color, setColor} = useContext(CustomTheme);
  const {toast} = useContext(SnackbarContext);

  useFocusEffect(
    useCallback(() => {
      NativeModules.AlarmModule.ignoringBattery(setIgnoring);
    }, []),
  );

  useEffect(() => {
    updateSettings({
      vibrate: +vibrate,
      alarm: +alarm,
      predict: +predict,
      sound,
      notify: +notify,
      images: +images,
      showUnit: +showUnit,
      color,
    });
    getSettings();
  }, [vibrate, alarm, predict, sound, notify, images, showUnit, color]);

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
      if (enabled) toast('Predict your next set based on todays plan.', 4000);
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

  const changeImages = useCallback(
    (enabled: boolean) => {
      setImages(enabled);
      if (enabled) toast('Show images for sets.', 4000);
      else toast('Stopped showing images for sets.', 4000);
    },
    [toast],
  );

  const changeUnit = useCallback(
    (enabled: boolean) => {
      setShowUnit(enabled);
      if (enabled) toast('Show option to select unit for sets.', 4000);
      else toast('Hid the unit option when adding/editing sets.', 4000);
    },
    [toast],
  );

  const switches: Input<boolean>[] = [
    {name: 'Rest timers', value: alarm, onChange: changeAlarmEnabled},
    {name: 'Vibrate', value: vibrate, onChange: changeVibrate},
    {name: 'Predict sets', value: predict, onChange: changePredict},
    {name: 'Record notifications', value: notify, onChange: changeNotify},
    {name: 'Show images', value: images, onChange: changeImages},
    {name: 'Show unit', value: showUnit, onChange: changeUnit},
  ];

  return (
    <Page search={search} setSearch={setSearch}>
      <ScrollView style={{marginTop: MARGIN}}>
        {switches
          .filter(input =>
            input.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map(input => (
            <React.Fragment key={input.name}>
              <Text style={styles.item}>{input.name}</Text>
              <MassiveSwitch
                style={styles.item}
                value={input.value}
                onValueChange={input.onChange}
              />
            </React.Fragment>
          ))}
        {'alarm sound'.includes(search.toLowerCase()) && (
          <Button style={{alignSelf: 'flex-start'}} onPress={changeSound}>
            Alarm sound
            {sound
              ? ': ' + sound.split('/')[sound.split('/').length - 1]
              : null}
          </Button>
        )}
        {'color'.includes(search.toLowerCase()) && (
          <Picker
            style={{color}}
            dropdownIconColor={color}
            selectedValue={color}
            onValueChange={value => setColor(value)}>
            <Picker.Item value="#B3E5fC" label="Cyan theme" color="#B3E5fC" />
            <Picker.Item value="#8156a7" label="Purple theme" color="#8156a7" />
            <Picker.Item value="#007AFF" label="Blue theme" color="#007AFF" />
            <Picker.Item value="#ffc0cb" label="Pink theme" color="#ffc0cb" />
          </Picker>
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
    </Page>
  );
}

const styles = StyleSheet.create({
  item: {
    alignSelf: 'flex-start',
    marginBottom: MARGIN,
    marginLeft: MARGIN,
  },
});
