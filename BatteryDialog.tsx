import React from 'react';
import {NativeModules, Text} from 'react-native';
import {Button, Dialog, Portal} from 'react-native-paper';

export default function BatteryDialog({
  show,
  setShow,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
}) {
  const ok = () => {
    NativeModules.AlarmModule.openBatteryOptimizations();
    setShow(false);
  };

  return (
    <Portal>
      <Dialog visible={show} onDismiss={() => setShow(false)}>
        <Dialog.Title>Battery optimizations</Dialog.Title>
        <Dialog.Content>
          <Text>
            Disable battery optimizations for Massive to use rest timers.
          </Text>
          <Text>
            Settings {'>'} Battery {'>'} Unrestricted
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={ok}>Open settings</Button>
          <Button onPress={() => setShow(false)}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
