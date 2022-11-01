import React, {useCallback, useState} from 'react'
import {GestureResponderEvent, ListRenderItemInfo, View} from 'react-native'
import {List, Menu, RadioButton, useTheme} from 'react-native-paper'
import {Like} from 'typeorm'
import CountMany from './count-many'
import {getNow, setRepo} from './db'
import {toast} from './toast'

interface Props extends ListRenderItemInfo<CountMany> {
  onSelect: (index: number) => void
  selected: number
  onUndo: () => void
}

export default function StartPlanItem(props: Props) {
  const {index, item, onSelect, selected, onUndo} = props
  const {colors} = useTheme()
  const [anchor, setAnchor] = useState({x: 0, y: 0})
  const [showMenu, setShowMenu] = useState(false)

  const undo = useCallback(async () => {
    const [{now}] = await getNow()
    const created = now.split('T')[0]
    const first = await setRepo.findOne({
      where: {
        name: item.name,
        hidden: 0 as any,
        created: Like(`${created}%`),
      },
      order: {created: 'desc'},
    })
    setShowMenu(false)
    if (!first) return toast('Nothing to undo.')
    await setRepo.delete(first.id)
    onUndo()
  }, [setShowMenu, onUndo, item.name])

  const longPress = useCallback(
    (e: GestureResponderEvent) => {
      setAnchor({x: e.nativeEvent.pageX, y: e.nativeEvent.pageY})
      setShowMenu(true)
    },
    [setShowMenu, setAnchor],
  )

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
            color={colors.primary}
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
  )
}
