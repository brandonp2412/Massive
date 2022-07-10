import React, {useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Button, Dialog, Portal, TextInput} from 'react-native-paper';
import Set from './set';
import {format} from './time';

export default function EditSet({
  set,
  setSet,
  onSave,
  title,
  saveText,
  show,
  setShow,
}: {
  onSave: () => void;
  set?: Set;
  setSet: (set?: Set) => void;
  title: string;
  saveText: string;
  show: boolean;
  setShow: (show: boolean) => void;
}) {
  const [showDate, setShowDate] = useState(false);

  const onConfirm = (created: Date) => {
    setSet({...set, created: created.toISOString()});
    setShowDate(false);
  };

  return (
    <Portal>
      <Dialog visible={show} onDismiss={() => setShow(false)}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView>
            <TextInput
              style={styles.text}
              autoFocus
              label="Name *"
              value={set?.name}
              onChangeText={name => setSet({...set, name})}
              autoCorrect={false}
            />
            <TextInput
              style={styles.text}
              label="Reps *"
              keyboardType="numeric"
              value={set?.reps?.toString() || ''}
              onChangeText={reps => setSet({...set, reps})}
            />
            <TextInput
              style={styles.text}
              label="Weight *"
              keyboardType="numeric"
              value={set?.weight?.toString() || ''}
              onChangeText={weight => setSet({...set, weight})}
              onSubmitEditing={onSave}
            />
            <TextInput
              style={styles.text}
              label="Unit (kg)"
              value={set?.unit}
              onChangeText={unit => setSet({...set, unit})}
              onSubmitEditing={onSave}
            />
            {set?.created && (
              <>
                <Button
                  icon="calendar-outline"
                  onPress={() => setShowDate(true)}>
                  {format(set.created)}
                </Button>
                <DateTimePickerModal
                  isVisible={showDate}
                  mode="datetime"
                  onConfirm={onConfirm}
                  onCancel={() => setShowDate(false)}
                  date={new Date(set.created)}
                />
              </>
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button icon="close" onPress={() => setShow(false)}>
            Cancel
          </Button>
          <Button mode="contained" icon="save" onPress={onSave}>
            {saveText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  text: {
    marginBottom: 10,
  },
});
