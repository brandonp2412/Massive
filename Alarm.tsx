import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {NativeModules, StyleSheet, Text, View} from 'react-native';
import {Button, Modal, Portal} from 'react-native-paper';

export default function Alarm() {
  const [show, setShow] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);

  let intervalId: number;

  useEffect(() => {
    if (!show) return;
    (async () => {
      const next = await AsyncStorage.getItem('nextAlarm');
      if (!next) return;
      const milliseconds = new Date(next).getTime() - new Date().getTime();
      if (milliseconds <= 0) return;
      let secondsLeft = milliseconds / 1000;
      setSeconds(Math.floor(secondsLeft % 60));
      setMinutes(Math.floor(secondsLeft / 60));
      intervalId = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) return clearInterval(intervalId);
        setSeconds(Math.floor(secondsLeft % 60));
        setMinutes(Math.floor(secondsLeft / 60));
      }, 1000);
    })();
    return () => clearInterval(intervalId);
  }, [show]);

  const stop = async () => {
    NativeModules.AlarmModule.stop();
    clearInterval(intervalId);
    setSeconds(0);
    setMinutes(0);
    await AsyncStorage.setItem('nextAlarm', '');
  };

  return (
    <>
      <Portal>
        <Modal
          visible={show}
          style={styles.center}
          onDismiss={() => setShow(false)}>
          <Text style={[styles.center, styles.title]}>Resting</Text>
          <Text style={styles.center}>
            {minutes}:{seconds}
          </Text>
          <View style={{flexDirection: 'row'}}>
            <Button icon="close" onPress={() => setShow(false)}>
              Close
            </Button>
            <Button mode="contained" icon="stop" onPress={stop}>
              Stop
            </Button>
          </View>
        </Modal>
      </Portal>
      <Button icon="time" onPress={() => setShow(true)}>
        Time left
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
  },
});
