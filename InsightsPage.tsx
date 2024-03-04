import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import AppPieChart from "./AppPieChart";
import AppLineChart from "./AppLineChart";
import ConfirmDialog from "./ConfirmDialog";
import { MARGIN, PADDING } from "./constants";
import { AppDataSource } from "./data-source";
import { DAYS } from "./days";
import DrawerHeader from "./DrawerHeader";
import { Periods } from "./periods";
import Select from "./Select";

interface WeekCount {
  week: string;
  count: number;
}

interface HourCount {
  hour: string;
  count: number;
}

export default function InsightsPage() {
  const [weekCounts, setWeekCounts] = useState<WeekCount[]>();
  const [hourCounts, setHourCounts] = useState<HourCount[]>();
  const [loadingWeeks, setLoadingWeeks] = useState(true);
  const [loadingHours, setLoadingHours] = useState(true);
  const [period, setPeriod] = useState(Periods.Monthly);
  const [showWeek, setShowWeek] = useState(false);
  const [showHour, setShowHour] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let difference = "-1 months";
      if (period === Periods.TwoMonths) difference = "-2 months";
      if (period === Periods.ThreeMonths) difference = "-3 months";
      if (period === Periods.SixMonths) difference = "-6 months";

      const selectWeeks = `
        SELECT strftime('%w', created) as week, COUNT(*) as count
          FROM sets
          WHERE DATE(created) >= DATE('now', 'weekday 0', '${difference}')
          GROUP BY week
          HAVING week IS NOT NULL
          ORDER BY count DESC;
      `;
      const selectHours = `
        SELECT strftime('%H', created) AS hour, COUNT(*) AS count
          FROM sets
          WHERE DATE(created) >= DATE('now', 'weekday 0', '${difference}')
          GROUP BY hour
          having hour is not null
          ORDER BY hour
      `;

      setLoadingWeeks(true);
      setLoadingHours(true);
      setTimeout(
        () =>
          AppDataSource.manager
            .query(selectWeeks)
            .then(setWeekCounts)
            .then(() => setLoadingWeeks(false))
            .then(() =>
              AppDataSource.manager.query(selectHours).then(setHourCounts)
            )
            .finally(() => {
              setLoadingWeeks(false);
              setLoadingHours(false);
            }),
        400
      );
    }, [period])
  );

  const hourLabel = (hour: string) => {
    let twelveHour = Number(hour);
    if (twelveHour === 0) return "12AM";
    let amPm = "AM";
    if (twelveHour >= 12) amPm = "PM";
    if (twelveHour > 12) twelveHour -= 12;
    return `${twelveHour} ${amPm}`;
  };

  const hourCharts = useMemo(() => {
    if (loadingHours) return <ActivityIndicator />
    if (hourCounts?.length === 0) return (<Text style={{ marginBottom: MARGIN }}>
      No entries yet! Start recording sets to see your most active days of
      the week.
    </Text>)
    return <AppLineChart
      data={hourCounts.map((hc) => hc.count)}
      labels={hourCounts.map((hc) => hourLabel(hc.hour))}
    />

  }, [hourCounts, loadingHours])

  const weekCharts = useMemo(() => {
    if (loadingWeeks) return <ActivityIndicator />
    if (weekCounts?.length === 0) return (<Text style={{ marginBottom: MARGIN }}>
      No entries yet! Start recording sets to see your most active days of
      the week.
    </Text>)
    return <AppPieChart
      options={weekCounts.map((weekCount) => ({
        label: DAYS[weekCount.week],
        value: weekCount.count,
      }))}
    />
  }, [weekCounts, loadingWeeks])

  return (
    <>
      <DrawerHeader name="Insights" />
      <View
        style={{
          paddingLeft: PADDING,
          paddingTop: PADDING,
          paddingRight: PADDING,
        }}
      >
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
      </View>
      <ScrollView
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
            onPress={() => setShowWeek(true)}
          />
        </View>

        {weekCharts}

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
            Most active hours of the day
          </Text>
          <IconButton
            icon="help-circle-outline"
            size={25}
            style={{ padding: 0, margin: 0, paddingBottom: 10 }}
            onPress={() => setShowHour(true)}
          />
        </View>

        {hourCharts}
        <View style={{ marginBottom: MARGIN }} />
      </ScrollView>

      <ConfirmDialog
        title="Most active days of the week"
        show={showWeek}
        setShow={setShowWeek}
        onOk={() => setShowWeek(false)}
      >
        Are mondays your weak-spot? Find out here. This counts the # of sets you
        tend to do based on the day of the week.
      </ConfirmDialog>

      <ConfirmDialog
        title="Most active hours of the day"
        show={showHour}
        setShow={setShowHour}
        onOk={() => setShowHour(false)}
      >
        If you find yourself giving up on the gym after 5pm, consider starting
        earlier! Or vice-versa. This counts the # of sets you tend to do, based
        on what time of day you began your workout.
      </ConfirmDialog>
    </>
  );
}
