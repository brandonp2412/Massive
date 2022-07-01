import React, {useState} from 'react';
import {
  Button,
  SafeAreaView,
  StatusBar,
  TextInput,
  useColorScheme,
  Vibration,
  View,
} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import {Notifications} from 'react-native-notifications';
import Sound from 'react-native-sound';

const App = () => {
  const dark = useColorScheme() === 'dark';
  const alarm = new Sound('argon.mp3', Sound.MAIN_BUNDLE, error => {
    if (error) throw new Error(error);
  });
  const [timer, setTimer] = useState('0');

  Notifications.registerRemoteNotifications();
  Notifications.events().registerNotificationOpened(
    (notification, completion) => {
      console.log('Notification opened:', notification);
      alarm.stop();
      Vibration.cancel();
      completion();
    },
  );

  const press = () => {
    BackgroundTimer.setTimeout(() => {
      alarm.play(_onEnd => Vibration.cancel());
      Vibration.vibrate([0, 400, 600], /*repeat=*/ true);
      Notifications.postLocalNotification({
        title: 'title',
        body: 'body',
        badge: 1,
        identifier: 'identifier',
        payload: {},
        sound: 'sound',
        thread: 'thread',
        type: 'type',
      });
    }, Number(timer));
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <View
        style={{
          margin: 10,
          alignItems: 'center',
        }}>
        <TextInput placeholder="Timer" value={timer} onChangeText={setTimer} />
      </View>
      <View style={{margin: 30, marginTop: 'auto'}}>
        <Button title="Run timer" onPress={press} />
      </View>
    </SafeAreaView>
  );
};

export default App;
