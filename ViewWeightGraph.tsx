import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";
import { FileSystem } from "react-native-file-access";
import { IconButton, List } from "react-native-paper";
import Share from "react-native-share";
import { captureScreen } from "react-native-view-shot";
import AppLineChart from "./AppLineChart";
import { MARGIN, PADDING } from "./constants";
import { settingsRepo, weightRepo } from "./db";
import { Periods } from "./periods";
import Select from "./Select";
import StackHeader from "./StackHeader";
import Weight from "./weight";
import { useFocusEffect } from "@react-navigation/native";
import Settings from "./settings";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import AppInput from "./AppInput";

export default function ViewWeightGraph() {
  const [weights, setWeights] = useState<Weight[]>();
  const [period, setPeriod] = useState(Periods.TwoMonths);
  const [start, setStart] = useState<Date | null>(null)
  const [end, setEnd] = useState<Date | null>(null)
  const [settings, setSettings] = useState<Settings>({} as Settings);

  useFocusEffect(useCallback(() => {
    settingsRepo.findOne({ where: {} }).then(setSettings)
  }, []))

  useEffect(() => {
    let difference = "-7 days";
    if (period === Periods.Monthly) difference = "-1 months";
    else if (period === Periods.TwoMonths) difference = "-2 months";
    else if (period === Periods.ThreeMonths) difference = "-3 months";
    else if (period === Periods.SixMonths) difference = "-6 months";
    else if (period === Periods.Yearly) difference = "-1 years";
    else if (period === Periods.AllTime) difference = null;

    let group = "%Y-%m-%d";
    if (period === Periods.Yearly) group = "%Y-%m";

    const builder = weightRepo
      .createQueryBuilder()
      .select("STRFTIME('%Y-%m-%d', created)", "created")
      .addSelect("AVG(value) as value")
      .addSelect("unit")
      .groupBy(`STRFTIME('${group}', created)`)

    if (difference)
      builder.where("DATE(created) >= DATE('now', 'weekday 0', :difference)", {
        difference,
      })

    if (start)
      builder.andWhere("DATE(created) >= :start", { start });
    if (end)
      builder.andWhere("DATE(created) <= :end", { end });

    builder
      .getRawMany()
      .then(setWeights);
  }, [period, start, end]);

  const pickStart = useCallback(() => {
    DateTimePickerAndroid.open({
      value: start || new Date(),
      onChange: (event, date) => {
        if (event.type === 'dismissed') return;
        if (date === start) return;
        setStart(date);
        setPeriod(Periods.AllTime);
        Keyboard.dismiss();
      },
      mode: "date",
    });
  }, [start]);

  const pickEnd = useCallback(() => {
    DateTimePickerAndroid.open({
      value: end || new Date(),
      onChange: (event, date) => {
        if (event.type === 'dismissed') return;
        if (date === end) return;
        setEnd(date);
        setPeriod(Periods.AllTime);
        Keyboard.dismiss();
      },
      mode: "date",
    });
  }, [end]);


  const charts = useMemo(() => {
    if (!weights) return;
    if (weights?.length === 0) {
      return <List.Item title="No data yet." />;
    }

    return (
      <AppLineChart
        data={weights.map((set) => set.value)}
        labels={weights.map((weight) =>
          format(new Date(weight.created), "yyyy-MM-d")
        )}
      />
    );
  }, [weights]);

  return (
    <>
      <StackHeader title="Weight graph">
        <IconButton
          onPress={() =>
            captureScreen().then(async (uri) => {
              const base64 = await FileSystem.readFile(uri, "base64");
              const url = `data:image/jpeg;base64,${base64}`;
              Share.open({
                type: "image/jpeg",
                url,
              });
            })
          }
          icon="share"
        />
      </StackHeader>
      <ScrollView style={{ padding: PADDING }}>
        <Select
          label="Period"
          items={[
            { value: Periods.Weekly, label: Periods.Weekly },
            { value: Periods.Monthly, label: Periods.Monthly },
            { value: Periods.TwoMonths, label: Periods.TwoMonths },
            { value: Periods.ThreeMonths, label: Periods.ThreeMonths },
            { value: Periods.SixMonths, label: Periods.SixMonths },
            { value: Periods.Yearly, label: Periods.Yearly },
            { value: Periods.AllTime, label: Periods.AllTime },
          ]}
          onChange={(value) => {
            setPeriod(value as Periods);
            if (value === Periods.AllTime) return;
            setStart(null);
            setEnd(null);
          }}
          value={period}
        />

        <View style={{ flexDirection: 'row', marginBottom: MARGIN }}>
          <AppInput
            label="Start date"
            value={start ? format(start, settings.date || "Pp") : null}
            onPressOut={pickStart}
            style={{ flex: 1, marginRight: MARGIN }}
          />
          <AppInput
            label="End date"
            value={end ? format(end, settings.date || "Pp") : null}
            onPressOut={pickEnd}
            style={{ flex: 1 }}
          />
        </View>

        {charts}
      </ScrollView>
    </>
  );
}
