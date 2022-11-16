import {useState} from 'react'
import {Button, Menu, useTheme} from 'react-native-paper'
import RNPickerSelect from 'react-native-picker-select'
import {Item} from 'react-native-picker-select'

export default function Select({
  value,
  onChange,
  items,
}: {
  value: string
  onChange: (value: string) => void
  items: Item[]
}) {
  const {colors} = useTheme()
  const [show, setShow] = useState(false)

  return (
    <Menu
      style={{alignSelf: 'flex-start', justifyContent: 'flex-start'}}
      visible={show}
      onDismiss={() => setShow(false)}
      anchor={<Button style={{alignSelf: 'flex-start'}}>{value}</Button>}>
      {items.map(item => (
        <Menu.Item title={item.label} onPress={() => onChange(item.value)} />
      ))}
    </Menu>
  )
}
