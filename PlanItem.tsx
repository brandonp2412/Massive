import React, {useState} from 'react';
import {IconButton, List, Menu} from 'react-native-paper';
import {getDb} from './db';
import {Plan} from './plan';

export default function PlanItem({
  item,
  setId,
  setShowEdit,
  onRemove,
}: {
  item: Plan;
  setId: (id: number) => void;
  setShowEdit: (show: boolean) => void;
  onRemove: () => void;
}) {
  const [show, setShow] = useState(false);

  const remove = async () => {
    const db = await getDb();
    await db.executeSql(`DELETE FROM plans WHERE id = ?`, [item.id]);
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
        title={item.days}
        description={item.workouts}
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
