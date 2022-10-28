import {ComponentProps} from 'react';
import {FAB} from 'react-native-paper';
import {useColor} from './color';
import {lightColors} from './colors';

export default function MassiveFab(props: Partial<ComponentProps<typeof FAB>>) {
  const {color} = useColor();
  const fabColor = lightColors.map(lightColor => lightColor.hex).includes(color)
    ? 'black'
    : undefined;

  return (
    <FAB
      icon="add"
      color={fabColor}
      style={{
        position: 'absolute',
        right: 10,
        bottom: 10,
        backgroundColor: color,
      }}
      {...props}
    />
  );
}
