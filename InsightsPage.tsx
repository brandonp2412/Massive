import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import AppBarChart from "./AppBarChart";
import { MARGIN, PADDING } from "./constants";
import { AppDataSource } from "./data-source";
import DrawerHeader from "./DrawerHeader";
import { DAYS } from "./time";
import Select from "./Select";
import { Periods } from "./periods";
import ConfirmDialog from "./ConfirmDialog";

export interface WeekCounts {
  week: number;
  count: number;
}

export default function InsightsPage() {
  const [weekCounts, setWeekCounts] = useState<WeekCounts[]>([]);
  const [period, setPeriod] = useState(Periods.Monthly);
  const [showActive, setShowActive] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let difference = "-1 months";
      if (period === Periods.TwoMonths) difference = "-2 months";
      if (period === Periods.ThreeMonths) difference = "-3 months";
      if (period === Periods.SixMonths) difference = "-6 months";
      const select = `
      SELECT strftime('%w', created) as week, COUNT(*) as count
      FROM sets
      WHERE DATE(created) >= DATE('now', 'weekday 0', '${difference}')
      GROUP BY week
      HAVING week IS NOT NULL
      ORDER BY count DESC;
    `;
      AppDataSource.manager.query(select).then(setWeekCounts);
    }, [period])
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignContent: "center",
          }}
        >
          <Text
            variant="titleLarge"
            style={{
              marginBottom: MARGIN,
            }}
          >
            Most active days of the week
          </Text>
          <IconButton
            icon="help-circle-outline"
            size={25}
            style={{ padding: 0, margin: 0, paddingBottom: 10 }}
            onPress={() => setShowActive(true)}
          />
        </View>

        <Select
          label="Period"
          items={[
            { value: Periods.Monthly, label: Periods.Monthly },
            { value: Periods.TwoMonths, label: Periods.TwoMonths },
            { value: Periods.ThreeMonths, label: Periods.ThreeMonths },
            { value: Periods.SixMonths, label: Periods.SixMonths },
          ]}
          value={period}
          onChange={(value) => setPeriod(value as Periods)}
        />
        <AppBarChart
          options={weekCounts.map((weekCount) => ({
            label: DAYS[weekCount.week],
            value: weekCount.count,
          }))}
        />
      </View>
      <ConfirmDialog
        title="Most active days of the week"
        show={showActive}
        setShow={setShowActive}
        onOk={() => setShowActive(false)}
      >
        If your plan expects an equal # of sets each day of the week, then this
        pie graph should be evenly sliced.
      </ConfirmDialog>
    </>
  );
}
