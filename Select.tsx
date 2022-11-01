import {Picker} from '@react-native-picker/picker'
import {useTheme} from 'react-native-paper'

export default function Select({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (value: string) => void
  children: JSX.Element | JSX.Element[]
}) {
  const {colors} = useTheme()

  return (
    <Picker
      style={{color: colors.primary}}
      dropdownIconColor={colors.text}
      selectedValue={value}
      onValueChange={onChange}>
      {children}
    </Picker>
  )
}
