import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {NativeModules, View} from 'react-native';
import {Button, Subheading, Title} from 'react-native-paper';
import DrawerHeader from './DrawerHeader';
import MassiveFab from './MassiveFab';
import Page from './Page';
import {getSettings, updateSettings} from './settings.service';
import {useSettings} from './use-settings';

export default function TimerPage() {
  const [remaining, setRemaining] = useState(0);
  const {settings} = useSettings();

  const minutes = Math.floor(remaining / 1000 / 60);
  const seconds = Math.floor((remaining / 1000) % 60);
  let interval = 0;

  const tick = useCallback(() => {
    let newRemaining = 0;
    getSettings().then(gotSettings => {
      if (!gotSettings.nextAlarm) return;
      const date = new Date(gotSettings.nextAlarm);
      newRemaining = date.getTime() - new Date().getTime();
      if (newRemaining < 0) setRemaining(0);
      else setRemaining(newRemaining);
    });
    interval = setInterval(() => {
      console.log({newRemaining});
      newRemaining -= 1000;
      if (newRemaining > 0) return setRemaining(newRemaining);
      clearInterval(interval);
      setRemaining(0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(tick);

  const stop = () => {
    NativeModules.AlarmModule.stop();
    clearInterval(interval);
    setRemaining(0);
    updateSettings({...settings, nextAlarm: undefined});
  };

  const add = async () => {
    if (!settings.nextAlarm) return;
    const date = new Date(settings.nextAlarm);
    date.setTime(date.getTime() + 1000 * 60);
    NativeModules.AlarmModule.add(date, settings.vibrate, settings.sound);
    await updateSettings({...settings, nextAlarm: date.toISOString()});
    tick();
  };

  return (
    <>
      <DrawerHeader name="Timer" />
      <Page>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Title>Remaining</Title>
          <Subheading>
            {minutes}:{seconds}
          </Subheading>
          <Button onPress={add}>Add 1 min</Button>
        </View>
      </Page>
      <MassiveFab icon="stop" onPress={stop} />
    </>
  );
}
