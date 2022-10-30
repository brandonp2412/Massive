import {ListRenderItemInfo, View} from 'react-native';
import {List, RadioButton} from 'react-native-paper';
import {useColor} from './color';
import CountMany from './count-many';

interface Props extends ListRenderItemInfo<CountMany> {
  onSelect: (index: number) => void;
  selected: number;
}

export default function StartPlanItem(props: Props) {
  const {index, item, onSelect, selected} = props;
  const {color} = useColor();

  return (
    <List.Item
      title={item.name}
      description={item.total.toString()}
      onPress={() => onSelect(index)}
      left={() => (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <RadioButton
            onPress={() => onSelect(index)}
            value={index.toString()}
            status={selected === index ? 'checked' : 'unchecked'}
            color={color}
          />
        </View>
      )}
    />
  );
}
