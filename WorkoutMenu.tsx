import {useState} from 'react';
import React from 'react';
import {Button, Divider, Menu} from 'react-native-paper';

export default function DayMenu({
  onSelect,
  onDelete,
  onAdd,
  selected,
  index,
  names,
}: {
  onSelect: (option: string) => void;
  onDelete: () => void;
  onAdd: () => void;
  selected: string;
  index: number;
  names: string[];
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
        <Button icon="barbell" onPress={() => setShow(true)}>
          {selected || 'Pick a workout'}
        </Button>
      }>
      {names.map(name => (
        <Menu.Item
          key={name}
          icon={selected === name ? 'checkmark-circle' : 'ellipse'}
          onPress={() => select(name)}
          title={name}
        />
      ))}
      {index > 0 && (
        <Menu.Item icon="trash" title="Delete" onPress={onDelete} />
      )}
    </Menu>
  );
}
