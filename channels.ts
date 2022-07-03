import PushNotification, {Importance} from 'react-native-push-notification';

export const ALARM = 'alarm';
PushNotification.createChannel(
  {
    channelId: ALARM,
    channelName: 'Alarms',
    channelDescription: 'Notifications of when alarms are triggered.',
    importance: Importance.HIGH,
    vibrate: false,
  },
  created => console.log(`Created channel ${created}`),
);
