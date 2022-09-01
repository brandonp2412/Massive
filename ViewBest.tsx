import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import * as shape from 'd3-shape';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useColorScheme, View} from 'react-native';
import {FileSystem} from 'react-native-file-access';
import {Text, IconButton} from 'react-native-paper';
import Share from 'react-native-share';
import {Grid, LineChart, XAxis, YAxis} from 'react-native-svg-charts';
import ViewShot from 'react-native-view-shot';
import {CombinedDarkTheme, CombinedDefaultTheme} from './App';
import {BestPageParams} from './BestPage';
import {DatabaseContext} from './Routes';
import Set from './set';
import {formatMonth} from './time';

interface Volume {
  name: string;
  created: string;
  value: number;
  unit: string;
}

export default function ViewBest() {
  const {params} = useRoute<RouteProp<BestPageParams, 'ViewBest'>>();
  const [weights, setWeights] = useState<Set[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const db = useContext(DatabaseContext);
  const navigation = useNavigation();
  const dark = useColorScheme() === 'dark';
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
    console.log(`${ViewBest.name}.useEffect`);
    const selectWeights = `
      SELECT max(weight) AS weight, 
        STRFTIME('%Y-%m-%d', created) as created, unit
      FROM sets
      WHERE name = ? AND NOT hidden
      GROUP BY name, STRFTIME('%Y-%m-%d', created)
    `;
    const selectVolumes = `
      SELECT sum(weight * reps) AS value, 
        STRFTIME('%Y-%m-%d', created) as created, unit
      FROM sets
      WHERE name = ? AND NOT hidden
      GROUP BY name, STRFTIME('%Y-%m-%d', created)
    `;
    const refresh = async () => {
      const [weightsResult] = await db.executeSql(selectWeights, [
        params.best.name,
      ]);
      if (weightsResult.rows.length === 0) return;
      setWeights(weightsResult.rows.raw());
      const [volumesResult] = await db.executeSql(selectVolumes, [
        params.best.name,
      ]);
      console.log(volumesResult.rows.raw());
      if (volumesResult.rows.length === 0) return;
      setVolumes(volumesResult.rows.raw());
    };
    refresh();
  }, [params.best.name, db]);

  const axesSvg = {fontSize: 10, fill: 'grey'};
  const verticalContentInset = {top: 10, bottom: 10};
  const xAxisHeight = 30;

  return (
    <ViewShot style={{padding: 10}} ref={viewShot}>
      <Text>Best weight per day</Text>
      <View style={{height: 300, padding: 20, flexDirection: 'row'}}>
        <YAxis
          data={weights.map(set => set.weight)}
          style={{marginBottom: xAxisHeight}}
          contentInset={verticalContentInset}
          svg={axesSvg}
          formatLabel={value => `${value}${weights[0].unit}`}
        />
        <View style={{flex: 1, marginLeft: 10}}>
          <LineChart
            style={{flex: 1}}
            data={weights.map(set => set.weight)}
            contentInset={verticalContentInset}
            curve={shape.curveBasis}
            svg={{
              stroke: dark
                ? CombinedDarkTheme.colors.primary
                : CombinedDefaultTheme.colors.primary,
            }}>
            <Grid />
          </LineChart>
          <XAxis
            style={{marginHorizontal: -10, height: xAxisHeight}}
            data={weights}
            formatLabel={(_value, index) =>
              formatMonth(weights[index].created!)
            }
            contentInset={{left: 10, right: 10}}
            svg={axesSvg}
          />
        </View>
      </View>
      <Text>Volume per day</Text>
      <View style={{height: 300, padding: 20, flexDirection: 'row'}}>
        <YAxis
          data={volumes.map(volume => volume.value)}
          style={{marginBottom: xAxisHeight}}
          contentInset={verticalContentInset}
          svg={axesSvg}
          formatLabel={(value: number) =>
            `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${
              volumes[0].unit
            }`
          }
        />
        <View style={{flex: 1, marginLeft: 10}}>
          <LineChart
            style={{flex: 1}}
            data={volumes.map(volume => volume.value)}
            contentInset={verticalContentInset}
            curve={shape.curveBasis}
            svg={{
              stroke: dark
                ? CombinedDarkTheme.colors.primary
                : CombinedDefaultTheme.colors.primary,
            }}>
            <Grid />
          </LineChart>
          <XAxis
            style={{marginHorizontal: -10, height: xAxisHeight}}
            data={weights}
            formatLabel={(_value, index) =>
              formatMonth(volumes[index]?.created)
            }
            contentInset={{left: 10, right: 10}}
            svg={axesSvg}
          />
        </View>
      </View>
    </ViewShot>
  );
}
