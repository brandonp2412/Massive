import React, {useContext, useEffect, useState} from 'react';
import {useColorScheme, View} from 'react-native';
import {Button, Dialog, Portal} from 'react-native-paper';
import {DatabaseContext} from './App';
import Best from './best';
import {AreaChart, Grid, LineChart, YAxis} from 'react-native-svg-charts';
import * as shape from 'd3-shape';

export default function ViewBest({
  best,
  setBest,
}: {
  best?: Best;
  setBest: (best?: Best) => void;
}) {
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [unit, setUnit] = useState<string>();
  const db = useContext(DatabaseContext);
  const dark = useColorScheme() === 'dark';

  useEffect(() => {
    const selectBest = `
      SELECT max(weight) AS weight, STRFTIME('%Y-%m-%d', created) as created, unit
      FROM sets
      WHERE name = ?
      GROUP BY name, STRFTIME('%Y-%m-%d', created)
    `;
    const refresh = async () => {
      const [result] = await db.executeSql(selectBest, [best?.name]);
      if (result.rows.length === 0) return;
      console.log(`${ViewBest.name}.${refresh.name}:`, result.rows.raw());
      setData(result.rows.raw().map(row => row.weight));
      setUnit(result.rows.item(0).unit);
    };
    refresh();
  }, [best]);

  const contentInset = {top: 20, bottom: 20};

  return (
    <Portal>
      <Dialog visible={!!best} onDismiss={() => setBest(undefined)}>
        <Dialog.Title>{best?.name}</Dialog.Title>
        <Dialog.Content>
          <View style={{height: 200, flexDirection: 'row'}}>
            <YAxis
              data={data}
              contentInset={contentInset}
              svg={{
                fill: 'grey',
                fontSize: 10,
              }}
              numberOfTicks={10}
              formatLabel={value => `${value}${unit}`}
            />
            <LineChart
              style={{flex: 1, marginLeft: 16}}
              data={data}
              svg={{stroke: 'rgb(134, 65, 244)'}}
              curve={shape.curveNatural}
              contentInset={contentInset}>
              <Grid />
            </LineChart>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button icon="close" onPress={() => setBest(undefined)}>
            Close
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
