import React, {useContext, useState} from 'react';
import {IconButton, List, Menu} from 'react-native-paper';
import {DatabaseContext} from './App';
import Set from './set';

export default function SetItem({
  item,
  setSet,
  onRemove,
}: {
  item: Set;
  setSet: (set: Set) => void;
  onRemove: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const db = useContext(DatabaseContext);

  const remove = async () => {
    await db.executeSql(`DELETE FROM sets WHERE id = ?`, [item.id]);
    setShowMenu(false);
    onRemove();
  };

  const copy = () => {
    const {id, ...set} = {...item};
    setSet(set);
    setShowMenu(false);
  };

  return (
    <>
      <List.Item
        onPress={() => {
          setSet(item);
        }}
        title={item.name}
        description={`${item.reps} x ${item.weight}${item.unit}`}
        onLongPress={() => setShowMenu(true)}
        right={() => (
          <Menu
            anchor={
              <IconButton
                icon="ellipsis-vertical"
                onPress={() => setShowMenu(true)}
              />
            }
            visible={showMenu}
            onDismiss={() => setShowMenu(false)}>
            <Menu.Item icon="trash" onPress={remove} title="Delete" />
            <Menu.Item icon="copy" onPress={copy} title="Copy" />
          </Menu>
        )}
      />
    </>
  );
}
