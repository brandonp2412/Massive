import {useTheme} from 'react-native-paper'
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

  return (
    <RNPickerSelect
      style={{
        placeholder: {
          color: 'white',
        },
      }}
      placeholder="Hello, world!"
      value={value}
      onValueChange={onChange}
      items={items}
    />
  )
}
