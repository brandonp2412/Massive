import {useCallback, useMemo, useState} from 'react'
import {Button, Menu, useTheme} from 'react-native-paper'
import {MARGIN} from './constants'

export interface Item {
  value: string
  label: string
  color?: string
}

export default function Select({
  value,
  onChange,
  items,
}: {
  value: string
  onChange: (value: string) => void
  items: Item[]
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
    <Menu
      visible={show}
      onDismiss={() => setShow(false)}
      anchor={
        <Button
          onPress={() => setShow(true)}
          style={{alignSelf: 'flex-start', marginTop: MARGIN}}>
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
  )
}
