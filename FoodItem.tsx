import { NavigationProp, useNavigation } from '@react-navigation/native'
import { format } from 'date-fns'
import { useCallback, useMemo } from 'react'
import { Image } from 'react-native'
import { List, Text } from 'react-native-paper'
import { FoodPageParams } from './FoodPage'
import { DARK_RIPPLE, DARK_TEXT, LIGHT_RIPPLE, LIGHT_TEXT } from './constants'
import Food from './food'
import Settings from './settings'
import useDark from './use-dark'

export default function FoodItem({
  food,
  settings,
  ids,
  setIds,
}: {
  food: Food
  onRemove: () => void
  settings: Settings
  ids: number[]
  setIds: (value: number[]) => void
}) {
  const dark = useDark()
  const navigation = useNavigation<NavigationProp<FoodPageParams>>()

  const longPress = useCallback(() => {
    if (ids.length > 0) return
    setIds([food.id])
  }, [ids.length, food.id, setIds])

  const press = useCallback(() => {
    if (ids.length === 0) return navigation.navigate('EditFood', { food })
    const removing = ids.find((id) => id === food.id)
    if (removing) setIds(ids.filter((id) => id !== food.id))
    else setIds([...ids, food.id])
  }, [ids, food, navigation, setIds])

  const backgroundColor = useMemo(() => {
    if (!ids.includes(food.id)) return
    if (dark) return DARK_RIPPLE
    return LIGHT_RIPPLE
  }, [dark, ids, food.id])

  return (
    <List.Item
      onPress={press}
      title={food.name}
      description={food.name}
      onLongPress={longPress}
      style={{ backgroundColor }}
      left={() =>
        settings.images &&
        food.image && (
          <Image
            source={{ uri: food.image }}
            style={{ height: 75, width: 75 }}
          />
        )}
      right={() => (
        settings.showDate && (
          <Text
            style={{
              alignSelf: 'center',
              color: dark ? DARK_TEXT : LIGHT_TEXT,
            }}
          >
            {format(new Date(food.created), settings.date || 'P')}
          </Text>
        )
      )}
    />
  )
}
