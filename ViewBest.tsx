import {Picker} from '@react-native-picker/picker';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {useColorScheme, View} from 'react-native';
import {FileSystem} from 'react-native-file-access';
import {IconButton} from 'react-native-paper';
import Share from 'react-native-share';
import {captureScreen} from 'react-native-view-shot';
import {getVolumes, getWeightsBy} from './best.service';
import Chart from './Chart';
import {PADDING} from './constants';
import {DrawerParamList} from './drawer-param-list';
import {Metrics} from './metrics';
import {Periods} from './periods';
import Set from './set';
import {formatMonth} from './time';
import Volume from './volume';

export default function ViewBest() {
  const {params} = useRoute<RouteProp<DrawerParamList, 'View best'>>();
  const dark = useColorScheme() === 'dark';
  const [weights, setWeights] = useState<Set[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [metric, setMetric] = useState(Metrics.Weight);
  const [period, setPeriod] = useState(Periods.Monthly);
  const navigation = useNavigation();

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
              captureScreen().then(async uri => {
                const base64 = await FileSystem.readFile(uri, 'base64');
                const url = `data:image/jpeg;base64,${base64}`;
                Share.open({
                  type: 'image/jpeg',
                  url,
                });
              })
            }
            icon="share"
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
    console.log(`${ViewBest.name}.useEffect`, {metric});
    console.log(`${ViewBest.name}.useEffect`, {period});
  }, [params.best.name, metric, period]);

  return (
    <View style={{padding: PADDING}}>
      <Picker
        style={{color: dark ? 'white' : 'black'}}
        dropdownIconColor={dark ? 'white' : 'black'}
        selectedValue={metric}
        onValueChange={value => setMetric(value)}>
        <Picker.Item value={Metrics.Volume} label={Metrics.Volume} />
        <Picker.Item value={Metrics.Weight} label={Metrics.Weight} />
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
    </View>
  );
}
