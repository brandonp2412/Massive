import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import {Button, Modal, Portal} from 'react-native-paper';

export default function Alarm() {
  const [show, setShow] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (!show) return;
    let intervalId: number;
    (async () => {
      const next = await AsyncStorage.getItem('nextAlarm');
      if (!next) return;
      const ms = new Date(next).getTime() - new Date().getTime();
      if (ms <= 0) return;
      let secondsLeft = ms / 1000;
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
          <Button mode="contained" onPress={() => setShow(false)}>
            Close
          </Button>
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
