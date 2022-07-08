import React, {useContext, useEffect, useState} from 'react';
import {useColorScheme} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import {Button, Dialog, Portal} from 'react-native-paper';
import {DatabaseContext} from './App';
import Best from './best';

export default function ViewBest({
  best,
  setBest,
}: {
  best?: Best;
  setBest: (best?: Best) => void;
}) {
  const [data, setData] = useState<
    {value: number; label: string; labelComponent: any}[]
  >([]);
  const [labels, setLabels] = useState<string[]>([]);
  const db = useContext(DatabaseContext);
  const dark = useColorScheme() === 'dark';

  const selectBest = `
    SELECT max(weight) AS weight, STRFTIME('%Y-%m-%d', created) as created
    FROM sets
    WHERE name = ?
    GROUP BY name, STRFTIME('%Y-%m-%d', created)
  `;

  const refresh = async () => {
    const [result] = await db.executeSql(selectBest, [best?.name]);
    if (result.rows.length === 0) return;
    console.log('ViewBest.refresh', result.rows.raw());
    setData(
      result.rows.raw().map(row => ({
        value: row.weight,
        label: row.created,
        labelComponent: () => null,
      })),
    );
  };

  useEffect(() => {
    refresh();
  }, [best]);

  return (
    <Portal>
      <Dialog visible={!!best} onDismiss={() => setBest(undefined)}>
        <Dialog.Title>{best?.name}</Dialog.Title>
        <Dialog.Content>
          <LineChart
            data={data}
            curved
            isAnimated
            yAxisLabelSuffix="kg"
            color={dark ? '#3498db' : 'black'}
            dataPointsColor={dark ? '#f1c40f' : 'black'}
            thickness={5}
            width={240}
          />
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
