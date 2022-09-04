import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FileSystem} from 'react-native-file-access';
import {IconButton} from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import {getVolumes, getWeightsBy} from './best.service';
import {BestPageParams} from './BestPage';
import Chart from './Chart';
import {Metrics} from './metrics';
import {Periods} from './periods';
import Set from './set';
import {formatMonth} from './time';
import Volume from './volume';

export default function ViewBest() {
  const {params} = useRoute<RouteProp<BestPageParams, 'ViewBest'>>();
  const [weights, setWeights] = useState<Set[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [metric, setMetric] = useState(Metrics.Weight);
  const [period, setPeriod] = useState(Periods.Monthly);
  const navigation = useNavigation();
  const viewShot = useRef<ViewShot>(null);

  useFocusEffect(
    useCallback(() => {
      console.log(`${ViewBest.name}.useFocusEffect`);
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        headerRight: () => (
          <IconButton
            onPress={() =>
              viewShot.current?.capture?.().then(async uri => {
                const base64 = await FileSystem.readFile(uri, 'base64');
                const url = `data:image/jpeg;base64,${base64}`;
                Share.open({
                  message: params.best.name,
                  type: 'image/jpeg',
                  url,
                  failOnCancel: false,
                });
              })
            }
            icon="share-social-outline"
          />
        ),
        title: params.best.name,
      });
    }, [navigation, params.best]),
  );

  useEffect(() => {
    if (metric === Metrics.Weight)
      getWeightsBy(params.best.name, period).then(setWeights);
    else if (metric === Metrics.Volume)
      getVolumes(params.best.name, period).then(setVolumes);

    console.log(`${ViewBest.name}.useEffect`, {metric, period});
  }, [params.best.name, metric, period]);

  return (
    <ViewShot style={{padding: 10}} ref={viewShot}>
      <RNPickerSelect
        onValueChange={setMetric}
        items={[
          {label: Metrics.Weight, value: Metrics.Weight},
          {label: Metrics.Volume, value: Metrics.Volume},
        ]}
        value={metric}
      />
      <RNPickerSelect
        onValueChange={setPeriod}
        items={[
          {label: Periods.Weekly, value: Periods.Weekly},
          {label: Periods.Monthly, value: Periods.Monthly},
          {label: Periods.Yearly, value: Periods.Yearly},
        ]}
        value={period}
      />
      {metric === Metrics.Volume && (
        <Chart
          yData={volumes.map(v => v.value)}
          yFormat={(value: number) =>
            `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${
              volumes[0].unit
            }`
          }
          xData={weights}
          xFormat={(_value, index) => formatMonth(weights[index].created!)}
        />
      )}
      {metric === Metrics.Weight && (
        <Chart
          yData={weights.map(set => set.weight)}
          yFormat={value => `${value}${weights[0].unit}`}
          xData={weights}
          xFormat={(_value, index) => formatMonth(weights[index].created!)}
        />
      )}
    </ViewShot>
  );
}
