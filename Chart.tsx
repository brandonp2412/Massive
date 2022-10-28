import * as shape from 'd3-shape';
import {View} from 'react-native';
import {Grid, LineChart, XAxis, YAxis} from 'react-native-svg-charts';
import {CombinedDarkTheme, CombinedDefaultTheme} from './App';
import {useColor} from './color';
import {MARGIN, PADDING} from './constants';
import Set from './set';
import useDark from './use-dark';

export default function Chart({
  yData,
  xFormat,
  xData,
  yFormat,
}: {
  yData: number[];
  xData: Set[];
  xFormat: (value: any, index: number) => string;
  yFormat: (value: any) => string;
}) {
  const {color} = useColor();
  const dark = useDark();
  const axesSvg = {
    fontSize: 10,
    fill: dark
      ? CombinedDarkTheme.colors.text
      : CombinedDefaultTheme.colors.text,
  };
  const verticalContentInset = {top: 10, bottom: 10};
  const xAxisHeight = 30;

  return (
    <>
      <View style={{height: 300, padding: PADDING, flexDirection: 'row'}}>
        <YAxis
          data={yData}
          style={{marginBottom: xAxisHeight}}
          contentInset={verticalContentInset}
          svg={axesSvg}
          formatLabel={yFormat}
        />
        <View style={{flex: 1, marginLeft: MARGIN}}>
          <LineChart
            style={{flex: 1}}
            data={yData}
            contentInset={verticalContentInset}
            curve={shape.curveBasis}
            svg={{
              stroke: color,
            }}>
            <Grid />
          </LineChart>
          <XAxis
            style={{marginHorizontal: -10, height: xAxisHeight}}
            data={xData}
            formatLabel={xFormat}
            contentInset={{left: 10, right: 10}}
            svg={axesSvg}
          />
        </View>
      </View>
    </>
  );
}
