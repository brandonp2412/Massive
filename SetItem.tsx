import React, {useContext, useState} from 'react';
import {IconButton, List, Menu} from 'react-native-paper';
import {DatabaseContext} from './App';
import Set from './set';

export default function SetItem({
  item,
  setSet,
  setShowEdit,
  onRemove,
}: {
  item: Set;
  setSet: (set: Set) => void;
  setShowEdit: (show: boolean) => void;
  onRemove: () => void;
}) {
  const [show, setShow] = useState(false);
  const db = useContext(DatabaseContext);

  const remove = async () => {
    await db.executeSql(`DELETE FROM sets WHERE id = ?`, [item.id]);
    setShow(false);
    onRemove();
  };

  return (
    <>
      <List.Item
        onPress={() => {
          setSet(item);
          setShowEdit(true);
        }}
        title={item.name}
        description={`${item.reps} x ${item.weight}${item.unit}`}
        onLongPress={() => setShow(true)}
        right={() => (
          <Menu
            anchor={
              <IconButton
                icon="ellipsis-vertical"
                onPress={() => setShow(true)}
              />
            }
            visible={show}
            onDismiss={() => setShow(false)}>
            <Menu.Item icon="trash" onPress={remove} title="Delete" />
          </Menu>
        )}
      />
    </>
  );
}
