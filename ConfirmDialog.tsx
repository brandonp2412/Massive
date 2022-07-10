import React from 'react';
import {Text} from 'react-native';
import {Button, Dialog, Portal} from 'react-native-paper';

export default function ConfirmDialog({
  title,
  children,
  onOk,
  show,
  setShow,
}: {
  title: string;
  children: string;
  onOk: () => void;
  show: boolean;
  setShow: (show: boolean) => void;
}) {
  return (
    <Portal>
      <Dialog visible={show} onDismiss={() => setShow(false)}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text>{children}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onOk}>OK</Button>
          <Button onPress={() => setShow(false)}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
