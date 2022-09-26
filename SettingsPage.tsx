import {Picker} from '@react-native-picker/picker';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {NativeModules, ScrollView} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Button} from 'react-native-paper';
import {CustomTheme} from './App';
import {darkColors, lightColors} from './colors';
import ConfirmDialog from './ConfirmDialog';
import {MARGIN} from './constants';
import Input from './input';
import {SnackbarContext} from './MassiveSnack';
import Page from './Page';
import {getSettings, settings, updateSettings} from './settings.service';
import Switch from './Switch';

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
  const [workouts, setWorkouts] = useState(!!settings.workouts);
  const [steps, setSteps] = useState(!!settings.steps);
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
      workouts: +workouts,
      steps: +steps,
    });
    getSettings();
  }, [
    vibrate,
    alarm,
    predict,
    sound,
    notify,
    images,
    showUnit,
    color,
    workouts,
    steps,
  ]);

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
      else toast('Hid unit option for sets.', 4000);
    },
    [toast],
  );

  const changeWorkouts = useCallback(
    (enabled: boolean) => {
      setWorkouts(enabled);
      if (enabled) toast('Show workout for sets.', 4000);
      else toast('Stopped showing workout for sets.', 4000);
    },
    [toast],
  );

  const changeSteps = useCallback(
    (enabled: boolean) => {
      setSteps(enabled);
      if (enabled) toast('Show steps for a workout.', 4000);
      else toast('Stopped showing steps for workouts.', 4000);
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
    {name: 'Show workouts', value: workouts, onChange: changeWorkouts},
    {name: 'Show steps', value: steps, onChange: changeSteps},
  ];

  return (
    <Page search={search} setSearch={setSearch}>
      <ScrollView style={{marginTop: MARGIN}}>
        {switches
          .filter(input =>
            input.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map(input => (
            <Switch
              onPress={() => input.onChange(!input.value)}
              key={input.name}
              value={input.value}
              onValueChange={input.onChange}>
              {input.name}
            </Switch>
          ))}
        {'theme'.includes(search.toLowerCase()) && (
          <Picker
            style={{color}}
            dropdownIconColor={color}
            selectedValue={color}
            onValueChange={value => setColor(value)}>
            {darkColors.concat(lightColors).map(colorOption => (
              <Picker.Item
                key={colorOption.hex}
                value={colorOption.hex}
                label={`${colorOption.name} theme`}
                color={colorOption.hex}
              />
            ))}
          </Picker>
        )}
        {'alarm sound'.includes(search.toLowerCase()) && (
          <Button style={{alignSelf: 'flex-start'}} onPress={changeSound}>
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
    </Page>
  );
}
