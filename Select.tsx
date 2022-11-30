import {useCallback, useMemo, useState} from 'react'
import {View} from 'react-native'
import {Button, Menu, Subheading, useTheme} from 'react-native-paper'

export interface Item {
  value: string
  label: string
  color?: string
}

export default function Select({
  value,
  onChange,
  items,
  label,
}: {
  value: string
  onChange: (value: string) => void
  items: Item[]
  label?: string
}) {
  const [show, setShow] = useState(false)
  const {colors} = useTheme()

  const selected = useMemo(
    () => items.find(item => item.value === value) || items[0],
    [items, value],
  )

  const handlePress = useCallback(
    (newValue: string) => {
      onChange(newValue)
      setShow(false)
    },
    [onChange],
  )

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      {label && <Subheading>{label}</Subheading>}
      <Menu
        visible={show}
        onDismiss={() => setShow(false)}
        anchor={
          <Button
            onPress={() => setShow(true)}
            style={{
              alignSelf: 'flex-start',
            }}>
            {selected?.label}
          </Button>
        }>
        {items.map(item => (
          <Menu.Item
            key={item.value}
            titleStyle={{color: item.color || colors.text}}
            title={item.label}
            onPress={() => handlePress(item.value)}
          />
        ))}
      </Menu>
    </View>
  )
}
