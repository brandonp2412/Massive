import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {NativeModules, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {MARGIN, PADDING} from './constants';
import {
  getNext,
  getSettings,
  settings,
  updateSettings,
} from './settings.service';

export default function TimerPage() {
  const [next, setNext] = useState(new Date());
  const [ms, setMs] = useState(0);
  const [intervalId, setIntervalId] = useState(0);

  const seconds =
    ms > 0
      ? Math.floor((ms / 1000) % 60)
          .toString()
          .padStart(2, '0')
      : '00';

  const minutes =
    ms > 0
      ? Math.floor(ms / 1000 / 60)
          .toString()
          .padStart(2, '0')
      : '00';

  useFocusEffect(
    useCallback(() => {
      getNext().then(nextIso =>
        setNext(nextIso ? new Date(nextIso) : new Date()),
      );
    }, []),
  );

  const tick = (date: Date) => {
    const remaining = date.getTime() - new Date().getTime();
    console.log(`${TimerPage.name}.useEffect`, {remaining});
    if (remaining <= 0) return;
    setMs(remaining);
  };

  useEffect(() => {
    console.log(`${TimerPage.name}.useEffect:`, {next});
    const date = next || new Date();
    tick(date);
    const id = setInterval(() => {
      tick(date);
    }, 1000);
    setIntervalId(oldId => {
      clearInterval(oldId);
      return id;
    });
    return () => clearInterval(id);
  }, [next]);

  const stop = () => {
    NativeModules.AlarmModule.stop();
    setNext(new Date());
    updateSettings({...settings, nextAlarm: undefined});
    getSettings();
    tick(new Date());
    setMs(0);
  };

  const add = async () => {
    console.log(`${TimerPage.name}.add:`, {intervalId, next});
    const date = next || new Date();
    date.setTime(date.getTime() + 1000 * 60);
    await updateSettings({...settings, nextAlarm: date.toISOString()});
    setNext(date);
    NativeModules.AlarmModule.add(ms, !!settings.vibrate, settings.sound);
    tick(date);
  };

  return (
    <View style={{padding: PADDING, alignItems: 'center'}}>
      <Text>
        {minutes}:{seconds}
      </Text>
      <Button style={{marginTop: MARGIN}} onPress={stop}>
        Stop
      </Button>
      <Button style={{marginTop: MARGIN}} onPress={add}>
        Add 1 min
      </Button>
    </View>
  );
}
