import {Picker} from '@react-native-picker/picker';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {View} from 'react-native';
import {getOneRepMax, getVolumes, getWeightsBy} from './best.service';
import {BestPageParams} from './BestPage';
import Chart from './Chart';
import {PADDING} from './constants';
import {Metrics} from './metrics';
import {Periods} from './periods';
import Set from './set';
import StackHeader from './StackHeader';
import {formatMonth} from './time';
import useDark from './use-dark';
import Volume from './volume';

export default function ViewBest() {
  const {params} = useRoute<RouteProp<BestPageParams, 'ViewBest'>>();
  const dark = useDark();
  const [weights, setWeights] = useState<Set[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [metric, setMetric] = useState(Metrics.Weight);
  const [period, setPeriod] = useState(Periods.Monthly);

  useEffect(() => {
    console.log(`${ViewBest.name}.useEffect`, {metric});
    console.log(`${ViewBest.name}.useEffect`, {period});
    switch (metric) {
      case Metrics.Weight:
        getWeightsBy(params.best.name, period).then(setWeights);
        break;
      case Metrics.Volume:
        getVolumes(params.best.name, period).then(setVolumes);
        break;
      default:
        getOneRepMax({name: params.best.name, period}).then(setWeights);
    }
  }, [params.best.name, metric, period]);

  return (
    <>
      <StackHeader title={params.best.name} />
      <View style={{padding: PADDING}}>
        <Picker
          style={{color: dark ? 'white' : 'black'}}
          dropdownIconColor={dark ? 'white' : 'black'}
          selectedValue={metric}
          onValueChange={value => setMetric(value)}>
          <Picker.Item value={Metrics.Volume} label={Metrics.Volume} />
          <Picker.Item value={Metrics.Weight} label={Metrics.Weight} />
          <Picker.Item value={Metrics.OneRepMax} label={Metrics.OneRepMax} />
        </Picker>
        <Picker
          style={{color: dark ? 'white' : 'black'}}
          dropdownIconColor={dark ? 'white' : 'black'}
          selectedValue={period}
          onValueChange={value => setPeriod(value)}>
          <Picker.Item value={Periods.Weekly} label={Periods.Weekly} />
          <Picker.Item value={Periods.Monthly} label={Periods.Monthly} />
          <Picker.Item value={Periods.Yearly} label={Periods.Yearly} />
        </Picker>
        {metric === Metrics.Volume ? (
          <Chart
            yData={volumes.map(v => v.value)}
            yFormat={(value: number) =>
              `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${
                volumes[0].unit || 'kg'
              }`
            }
            xData={weights}
            xFormat={(_value, index) => formatMonth(weights[index].created!)}
          />
        ) : (
          <Chart
            yData={weights.map(set => set.weight)}
            yFormat={value => `${value}${weights[0].unit}`}
            xData={weights}
            xFormat={(_value, index) => formatMonth(weights[index].created!)}
          />
        )}
      </View>
    </>
  );
}
