import {View} from 'react-native'
import {ITEM_PADDING} from './constants'
import {Button, Subheading} from 'react-native-paper'

export default function LabelledButton({
  label,
  onPress,
  children,
}: {
  label?: string
  onPress: () => void
  children: string
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: ITEM_PADDING,
      }}>
      <Subheading style={{width: 100}}>{label}</Subheading>
      <Button onPress={onPress}>{children}</Button>
    </View>
  )
}
