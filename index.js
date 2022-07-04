import 'react-native-gesture-handler';
import 'react-native-sqlite-storage';
import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import PushNotification from 'react-native-push-notification';
import {Provider as PaperProvider, DarkTheme} from 'react-native-paper';
import Ionicon from 'react-native-vector-icons/Ionicons';

export default function Main() {
  return (
    <PaperProvider
      theme={DarkTheme}
      settings={{icon: props => <Ionicon {...props} />}}>
      <App />
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);

PushNotification.configure({
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
  },

  onAction: function (notification) {
    console.log('ACTION:', notification.action);
    console.log('NOTIFICATION:', notification);
  },

  onRegistrationError: function (err) {
    console.error(err.message, err);
  },

  popInitialNotification: true,
  requestPermissions: false,
});
