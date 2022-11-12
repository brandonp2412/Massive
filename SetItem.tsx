import {NavigationProp, useNavigation} from '@react-navigation/native'
import {useCallback, useState} from 'react'
import {GestureResponderEvent, Image} from 'react-native'
import {Divider, List, Menu, Text} from 'react-native-paper'
import {setRepo} from './db'
import GymSet from './gym-set'
import {HomePageParams} from './home-page-params'
import Settings from './settings'
import useDark from './use-dark'
import {format} from 'date-fns'

export default function SetItem({
  item,
  onRemove,
  settings,
}: {
  item: GymSet
  onRemove: () => void
  settings: Settings
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [anchor, setAnchor] = useState({x: 0, y: 0})
  const dark = useDark()
  const navigation = useNavigation<NavigationProp<HomePageParams>>()

  const remove = useCallback(async () => {
    console.log(`${SetItem.name}.remove:`, {id: item.id})
    if (typeof item.id === 'number') await setRepo.delete(item.id)
    setShowMenu(false)
    onRemove()
  }, [setShowMenu, onRemove, item.id])

  const copy = useCallback(() => {
    const set: GymSet = {...item}
    delete set.id
    setShowMenu(false)
    navigation.navigate('EditSet', {set})
  }, [navigation, item])

  const longPress = useCallback(
    (e: GestureResponderEvent) => {
      setAnchor({x: e.nativeEvent.pageX, y: e.nativeEvent.pageY})
      setShowMenu(true)
    },
    [setShowMenu, setAnchor],
  )

  return (
    <>
      <List.Item
        onPress={() => navigation.navigate('EditSet', {set: item})}
        title={item.name}
        description={`${item.reps} x ${item.weight}${item.unit || 'kg'}`}
        onLongPress={longPress}
        left={() =>
          settings.images &&
          item.image && (
            <Image source={{uri: item.image}} style={{height: 75, width: 75}} />
          )
        }
        right={() => (
          <>
            {settings.showDate && (
              <Text
                style={{
                  alignSelf: 'center',
                  color: dark ? '#909090ff' : '#717171ff',
                }}>
                {format(new Date(item.created), settings.date)}
              </Text>
            )}
            <Menu
              anchor={anchor}
              visible={showMenu}
              onDismiss={() => setShowMenu(false)}>
              <Menu.Item icon="content-copy" onPress={copy} title="Copy" />
              <Divider />
              <Menu.Item icon="delete" onPress={remove} title="Delete" />
            </Menu>
          </>
        )}
      />
    </>
  )
}
