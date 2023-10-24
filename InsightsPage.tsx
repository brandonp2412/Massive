import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import AppBarChart from "./AppBarChart";
import { PADDING } from "./constants";
import { AppDataSource } from "./data-source";
import DrawerHeader from "./DrawerHeader";
import { DAYS } from "./time";

export interface WeekCounts {
  week: number;
  count: number;
}

export default function InsightsPage() {
  const [weekCounts, setWeekCounts] = useState<WeekCounts[]>([]);

  useFocusEffect(
    useCallback(() => {
      const select = `
        SELECT strftime('%w', created) as week, COUNT(*) as count
        FROM sets
        WHERE created IS NOT NULL
        GROUP BY week
        HAVING week IS NOT NULL
        ORDER BY count DESC;
      `;
      AppDataSource.manager.query(select).then(setWeekCounts);
    }, [])
  );

  return (
    <>
      <DrawerHeader name="Insights" />
      <View
        style={{
          padding: PADDING,
          flexGrow: 1,
        }}
      >
        <Text variant="titleLarge">Most active days of the week</Text>
        <AppBarChart
          options={weekCounts.map((weekCount) => ({
            label: DAYS[weekCount.week],
            value: weekCount.count,
          }))}
        />
      </View>
    </>
  );
}
