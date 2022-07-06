import {useState} from 'react';
import React from 'react';
import {Button, Divider, Menu} from 'react-native-paper';

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
  onAdd,
  selected,
  index,
}: {
  onSelect: (option: string) => void;
  onDelete: () => void;
  onAdd: () => void;
  selected: string;
  index: number;
}) {
  const [show, setShow] = useState(false);

  const add = () => {
    onAdd();
    setShow(false);
  };

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
          {selected}
        </Button>
      }>
      {days.map(day => (
        <Menu.Item
          icon={selected === day ? 'checkmark' : ''}
          onPress={() => select(day)}
          title={day}
        />
      ))}
      <Menu.Item icon="add" title="Add" onPress={add} />
      <Divider />
      {index > 0 && (
        <Menu.Item icon="trash" title="Delete" onPress={onDelete} />
      )}
    </Menu>
  );
}
