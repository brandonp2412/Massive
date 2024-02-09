import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";
import { FileSystem } from "react-native-file-access";
import { IconButton, List } from "react-native-paper";
import Share from "react-native-share";
import { captureScreen } from "react-native-view-shot";
import { StackParams } from "./AppStack";
import AppLineChart from "./AppLineChart";
import Select from "./Select";
import StackHeader from "./StackHeader";
import { MARGIN, PADDING } from "./constants";
import { setRepo, settingsRepo } from "./db";
import GymSet from "./gym-set";
import { Metrics } from "./metrics";
import { Periods } from "./periods";
import Volume from "./volume";
import AppInput from "./AppInput";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import Settings from "./settings";

export default function ViewGraph() {
  const { params } = useRoute<RouteProp<StackParams, "ViewGraph">>();
  const [weights, setWeights] = useState<GymSet[]>();
  const [volumes, setVolumes] = useState<Volume[]>();
  const [metric, setMetric] = useState(Metrics.OneRepMax);
  const [period, setPeriod] = useState(Periods.Monthly);
  const [unit, setUnit] = useState('kg');
  const [start, setStart] = useState<Date | null>(null)
  const [end, setEnd] = useState<Date | null>(null)
  const [settings, setSettings] = useState<Settings>({} as Settings);

  useFocusEffect(useCallback(() => {
    settingsRepo.findOne({ where: {} }).then(setSettings)
  }, []))

  const convertWeight = (weight: number, unitFrom: string, unitTo: string) => {
    let result = weight;
    if (unitFrom === unitTo) result = weight;
    if (unitFrom === 'lb' && unitTo === 'kg') result = weight * 0.453592;
    if (unitFrom === 'kg' && unitTo === 'lb') result = weight * 2.20462;
    return isNaN(result) ? 0 : result;
  };

  useEffect(() => {
    let difference = "-7 days";
    if (period === Periods.Monthly) difference = "-1 months";
    else if (period === Periods.Yearly) difference = "-1 years";
    else if (period === Periods.TwoMonths) difference = "-2 months";
    else if (period === Periods.ThreeMonths) difference = "-3 months";
    else if (period === Periods.SixMonths) difference = "-6 months";
    else if (period === Periods.AllTime) difference = null;

    let group = "%Y-%m-%d";
    if (period === Periods.Yearly) group = "%Y-%m";

    const builder = setRepo
      .createQueryBuilder()
      .select("STRFTIME('%Y-%m-%d', created)", "created")
      .addSelect("unit")
      .where("name = :name", { name: params.name })
      .andWhere("NOT hidden")

    if (start)
      builder.andWhere("DATE(created) >= :start", { start });
    if (end)
      builder.andWhere("DATE(created) <= :end", { end });
    if (difference)
      builder.andWhere("DATE(created) >= DATE('now', 'weekday 0', :difference)", {
        difference,
      });


    builder
      .groupBy("name")
      .addGroupBy(`STRFTIME('${group}', created)`);
    switch (metric) {
      case Metrics.Best:
        builder
          .addSelect("ROUND(MAX(weight), 2)", "weight")
          .getRawMany()
          .then(newWeights => newWeights.map(set => ({ ...set, weight: convertWeight(set.weight, set.unit, unit) })))
          .then(setWeights);
        break;
      case Metrics.Volume:
        builder
          .addSelect("ROUND(SUM(weight * reps), 2)", "value")
          .getRawMany()
          .then(newWeights => newWeights.map(set => ({ ...set, value: convertWeight(set.value, set.unit, unit) })))
          .then(setVolumes);
        break;
      default:
        // Brzycki formula https://en.wikipedia.org/wiki/One-repetition_maximum#Brzycki
        builder
          .addSelect(
            "ROUND(MAX(weight / (1.0278 - 0.0278 * reps)), 2)",
            "weight"
          )
          .getRawMany()
          .then(newWeights => newWeights.map(set => ({ ...set, weight: convertWeight(set.weight, set.unit, unit) })))
          .then((newWeights) => {
            console.log(`${ViewGraph.name}.oneRepMax:`, { weights: newWeights });
            setWeights(newWeights);
          });
    }
  }, [params.name, metric, period, unit, start, end]);

  const weightChart = useMemo(() => {
    if (weights === undefined) return null;

    if (weights.length === 0) return <List.Item title="No data yet." />;

    return (
      <AppLineChart
        data={weights.map((set) => set.weight)}
        labels={weights.map((set) =>
          format(new Date(set.created), "yyyy-MM-d")
        )}
      />
    );
  }, [weights]);

  const volumeChart = useMemo(() => {
    if (volumes === undefined) return null;
    if (volumes.length === 0) return <List.Item title="No data yet." />;

    return (
      <AppLineChart
        data={volumes.map((volume) => volume.value)}
        labels={volumes.map((volume) =>
          format(new Date(volume.created), "yyyy-MM-d")
        )}
      />
    );
  }, [volumes]);

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

  return (
    <>
      <StackHeader title={params.name}>
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
          label="Metric"
          items={[
            { value: Metrics.OneRepMax, label: Metrics.OneRepMax },
            { label: Metrics.Best, value: Metrics.Best },
            { value: Metrics.Volume, label: Metrics.Volume },
          ]}
          onChange={(value) => setMetric(value as Metrics)}
          value={metric}
        />

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

        <Select
          label="Unit"
          value={unit}
          onChange={setUnit}
          items={[
            { label: 'Pounds (lb)', value: 'lb' },
            { label: 'Kilograms (kg)', value: 'kg' },
            { label: 'Stone', value: 'stone' },
          ]}
        />
        <View style={{ paddingTop: PADDING }}>
          {metric === Metrics.Volume ? volumeChart : weightChart}
        </View>
      </ScrollView>
    </>
  );
}
