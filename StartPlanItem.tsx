import React, {useCallback, useState} from 'react';
import {GestureResponderEvent, ListRenderItemInfo, View} from 'react-native';
import {List, Menu, RadioButton} from 'react-native-paper';
import {useColor} from './color';
import CountMany from './count-many';
import {deleteFirst} from './set.service';

interface Props extends ListRenderItemInfo<CountMany> {
  onSelect: (index: number) => void;
  selected: number;
  onUndo: () => void;
}

export default function StartPlanItem(props: Props) {
  const {index, item, onSelect, selected, onUndo} = props;
  const {color} = useColor();
  const [anchor, setAnchor] = useState({x: 0, y: 0});
  const [showMenu, setShowMenu] = useState(false);

  const undo = useCallback(async () => {
    await deleteFirst(item.name);
    setShowMenu(false);
    onUndo();
  }, [setShowMenu, item.name, onUndo]);

  const longPress = useCallback(
    (e: GestureResponderEvent) => {
      setAnchor({x: e.nativeEvent.pageX, y: e.nativeEvent.pageY});
      setShowMenu(true);
    },
    [setShowMenu, setAnchor],
  );

  return (
    <List.Item
      onLongPress={longPress}
      title={item.name}
      description={item.total.toString()}
      onPress={() => onSelect(index)}
      left={() => (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <RadioButton
            onPress={() => onSelect(index)}
            value={index.toString()}
            status={selected === index ? 'checked' : 'unchecked'}
            color={color}
          />
        </View>
      )}
      right={() => (
        <>
          <Menu
            anchor={anchor}
            visible={showMenu}
            onDismiss={() => setShowMenu(false)}>
            <Menu.Item icon="undo" onPress={undo} title="Undo" />
          </Menu>
        </>
      )}
    />
  );
}
