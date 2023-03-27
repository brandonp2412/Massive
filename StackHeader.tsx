import {useNavigation} from '@react-navigation/native'
import {Appbar, IconButton} from 'react-native-paper'
import useDark from './use-dark'

export default function StackHeader({
  title,
  children,
}: {
  title: string
  children?: JSX.Element | JSX.Element[]
}) {
  const navigation = useNavigation()
  const dark = useDark()

  return (
    <Appbar.Header>
      <IconButton
        color={dark ? 'white' : 'white'}
        icon="arrow-back"
        onPress={navigation.goBack}
      />
      <Appbar.Content title={title} />
      {children}
    </Appbar.Header>
  )
}
