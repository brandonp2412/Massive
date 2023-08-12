import { Button, Dialog, Portal, Text } from "react-native-paper";

export default function ConfirmDialog({
  title,
  children,
  onOk,
  show,
  setShow,
  onCancel,
}: {
  title: string;
  children: JSX.Element | JSX.Element[] | string;
  onOk: () => void;
  show: boolean;
  setShow: (show: boolean) => void;
  onCancel?: () => void;
}) {
  const cancel = () => {
    setShow(false);
    onCancel && onCancel();
  };

  return (
    <Portal>
      <Dialog visible={show} onDismiss={() => setShow(false)}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text>{children}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onOk}>OK</Button>
          <Button onPress={cancel}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
