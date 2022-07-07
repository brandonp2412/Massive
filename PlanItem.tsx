import React, {useContext, useState} from 'react';
import {IconButton, List, Menu} from 'react-native-paper';
import {DatabaseContext} from './App';
import {Plan} from './plan';

export default function PlanItem({
  item,
  setPlan,
  setShowEdit,
  onRemove,
}: {
  item: Plan;
  setPlan: (plan: Plan) => void;
  setShowEdit: (show: boolean) => void;
  onRemove: () => void;
}) {
  const [show, setShow] = useState(false);
  const db = useContext(DatabaseContext);

  const remove = async () => {
    await db.executeSql(`DELETE FROM plans WHERE id = ?`, [item.id]);
    setShow(false);
    onRemove();
  };

  return (
    <>
      <List.Item
        onPress={() => {
          setPlan(item);
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
