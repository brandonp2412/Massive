import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {Button, Modal, StyleSheet, Text, View} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';

export default function Alarm({onClose}: {onClose: () => void}) {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  let intervalId: number;

  useEffect(() => {
    AsyncStorage.getItem('nextAlarm').then(async next => {
      if (!next) return;
      const ms = new Date(next).getTime() - new Date().getTime();
      if (ms <= 0) return;
      let secondsLeft = ms / 1000;
      console.log({secondsLeft});
      setSeconds(secondsLeft % 60);
      setMinutes(Math.floor(secondsLeft / 60));

      intervalId = setInterval(() => {
        console.log({seconds, secondsLeft});
        secondsLeft--;
        if (secondsLeft <= 0) return clearInterval(intervalId);
        setSeconds(Math.ceil(secondsLeft % 60));
        setMinutes(Math.floor(secondsLeft / 60));
      }, 1000);
    });
    return () => clearInterval(intervalId);
  }, []);

  const stop = () => {
    BackgroundTimer.clearInterval(intervalId);
    onClose();
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible
      onRequestClose={onClose}>
      <View style={styles.modal}>
        <Text style={styles.title}>Rest</Text>
        <Text style={styles.timer}>
          {minutes}:{seconds}
        </Text>
        <View style={{flexDirection: 'row'}}>
          <View style={styles.button}>
            <Button title="Close" color="#014B44" onPress={onClose} />
          </View>
          <View style={styles.button}>
            <Button title="Stop" onPress={stop} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  timer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  modal: {
    margin: 20,
    backgroundColor: '#20232a',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  button: {
    marginRight: 10,
  },
});
