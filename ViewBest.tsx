import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import * as shape from 'd3-shape';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {Grid, LineChart, XAxis, YAxis} from 'react-native-svg-charts';
import {DatabaseContext} from './App';
import {BestPageParams} from './BestPage';
import Set from './set';
import {formatMonth} from './time';

export default function ViewBest() {
  const {params} = useRoute<RouteProp<BestPageParams, 'ViewBest'>>();
  const [sets, setSets] = useState<Set[]>([]);
  const db = useContext(DatabaseContext);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        headerLeft: () => (
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} />
        ),
        title: params.best.name,
      });
    }, [navigation, params.best.name]),
  );

  useEffect(() => {
    const selectBest = `
      SELECT max(weight) AS weight, STRFTIME('%Y-%m-%d', created) as created, unit
      FROM sets
      WHERE name = ?
      GROUP BY name, STRFTIME('%Y-%m-%d', created)
    `;
    const refresh = async () => {
      const [result] = await db.executeSql(selectBest, [params.best.name]);
      if (result.rows.length === 0) return;
      console.log(`${ViewBest.name}.${refresh.name}:`, result.rows.raw());
      setSets(result.rows.raw());
    };
    refresh();
  }, [params.best.name, db]);

  const axesSvg = {fontSize: 10, fill: 'grey'};
  const verticalContentInset = {top: 10, bottom: 10};
  const xAxisHeight = 30;
  return (
    <View style={{padding: 10}}>
      <Text>Best weight per day</Text>
      <View style={{height: 200, padding: 20, flexDirection: 'row'}}>
        <YAxis
          data={sets.map(set => set.weight)}
          style={{marginBottom: xAxisHeight}}
          contentInset={verticalContentInset}
          svg={axesSvg}
          formatLabel={value => `${value}${sets[0].unit}`}
        />
        <View style={{flex: 1, marginLeft: 10}}>
          <LineChart
            style={{flex: 1}}
            data={sets.map(set => set.weight)}
            contentInset={verticalContentInset}
            curve={shape.curveNatural}
            svg={{stroke: 'rgb(134, 65, 244)'}}>
            <Grid />
          </LineChart>
          <XAxis
            style={{marginHorizontal: -10, height: xAxisHeight}}
            data={sets}
            formatLabel={(_value, index) => formatMonth(sets[index].created)}
            contentInset={{left: 10, right: 10}}
            svg={axesSvg}
          />
        </View>
      </View>
    </View>
  );
}
