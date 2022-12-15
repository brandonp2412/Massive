import {NavigationProp, useNavigation} from '@react-navigation/native'
import {format} from 'date-fns'
import {useCallback, useMemo} from 'react'
import {Image} from 'react-native'
import {List, Text} from 'react-native-paper'
import {DARK_RIPPLE, LIGHT_RIPPLE} from './constants'
import GymSet from './gym-set'
import {HomePageParams} from './home-page-params'
import Settings from './settings'
import useDark from './use-dark'

export default function SetItem({
  item,
  settings,
  ids,
  setIds,
}: {
  item: GymSet
  onRemove: () => void
  settings: Settings
  ids: number[]
  setIds: (value: number[]) => void
}) {
  const dark = useDark()
  const navigation = useNavigation<NavigationProp<HomePageParams>>()

  const longPress = useCallback(() => {
    if (ids.length > 0) return
    setIds([item.id])
  }, [ids.length, item.id, setIds])

  const press = useCallback(() => {
    if (ids.length === 0) return navigation.navigate('EditSet', {set: item})
    const removing = ids.find(id => id === item.id)
    if (removing) setIds(ids.filter(id => id !== item.id))
    else setIds([...ids, item.id])
  }, [ids, item, navigation, setIds])

  const backgroundColor = useMemo(() => {
    if (!ids.includes(item.id)) return
    if (dark) return DARK_RIPPLE
    return LIGHT_RIPPLE
  }, [dark, ids, item.id])

  return (
    <>
      <List.Item
        onPress={press}
        title={item.name}
        description={`${item.reps} x ${item.weight}${item.unit || 'kg'}`}
        onLongPress={longPress}
        style={{backgroundColor}}
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
                {format(new Date(item.created), settings.date || 'P')}
              </Text>
            )}
          </>
        )}
      />
    </>
  )
}
