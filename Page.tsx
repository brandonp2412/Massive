import {StyleSheet, View} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {PADDING} from './constants';
import MassiveFab from './MassiveFab';

export default function Page({
  onAdd,
  children,
  term,
  search,
}: {
  children: JSX.Element | JSX.Element[];
  onAdd?: () => void;
  term: string;
  search: (value: string) => void;
}) {
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search"
        value={term}
        onChangeText={search}
        icon="search"
        clearIcon="clear"
      />
      {children}
      {onAdd && <MassiveFab onPress={onAdd} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: PADDING,
  },
});
