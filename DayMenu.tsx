import React, {useState} from 'react';
import {Button, Menu} from 'react-native-paper';

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function DayMenu({
  onSelect,
  onDelete,
  selected,
  index,
}: {
  onSelect: (option: string) => void;
  onDelete: () => void;
  selected: string;
  index: number;
}) {
  const [show, setShow] = useState(false);

  const select = (day: string) => {
    onSelect(day);
    setShow(false);
  };

  return (
    <Menu
      visible={show}
      onDismiss={() => setShow(false)}
      anchor={
        <Button icon="today" onPress={() => setShow(true)}>
          {selected || 'Pick a day'}
        </Button>
      }>
      {days.map(day => (
        <Menu.Item
          key={day}
          icon={selected === day ? 'checkmark-circle' : 'ellipse'}
          onPress={() => select(day)}
          title={day}
        />
      ))}
      {index > 0 && (
        <Menu.Item icon="trash" title="Delete" onPress={onDelete} />
      )}
    </Menu>
  );
}
