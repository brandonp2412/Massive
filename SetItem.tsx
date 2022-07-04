import React, {useState} from 'react';
import {IconButton, List, Menu} from 'react-native-paper';
import {getDb} from './db';
import Set from './set';

export default function SetItem({
  item,
  setId,
  setShowEdit,
  onRemove,
}: {
  item: Set;
  setId: (id: number) => void;
  setShowEdit: (show: boolean) => void;
  onRemove: () => void;
}) {
  const [show, setShow] = useState(false);

  const remove = async () => {
    const db = await getDb();
    await db.executeSql(`DELETE FROM sets WHERE id = ?`, [item.id]);
    setShow(false);
    onRemove();
  };

  return (
    <>
      <List.Item
        onPress={() => {
          setId(item.id);
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
