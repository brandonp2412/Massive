import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Searchbar } from 'react-native-paper'
import AppFab from './AppFab'
import { PADDING } from './constants'

export default function Page({
  onAdd,
  children,
  term,
  search,
  style,
}: {
  children: JSX.Element | JSX.Element[]
  onAdd?: () => void
  term: string
  search: (value: string) => void
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View style={[styles.view, style]}>
      <Searchbar
        placeholder='Search'
        value={term}
        onChangeText={search}
        icon='search'
        clearIcon='clear'
      />
      {children}
      {onAdd && <AppFab onPress={onAdd} />}
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    padding: PADDING,
    flexGrow: 1,
  },
})
