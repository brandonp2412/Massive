import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { FileSystem } from "react-native-file-access";
import { IconButton, List } from "react-native-paper";
import Share from "react-native-share";
import { captureScreen } from "react-native-view-shot";
import Chart from "./Chart";
import { GraphsPageParams } from "./GraphsPage";
import Select from "./Select";
import StackHeader from "./StackHeader";
import { PADDING } from "./constants";
import { setRepo } from "./db";
import GymSet from "./gym-set";
import { Metrics } from "./metrics";
import { Periods } from "./periods";
import Volume from "./volume";
import { format } from "date-fns";

export default function ViewGraph() {
  const { params } = useRoute<RouteProp<GraphsPageParams, "ViewGraph">>();
  const [weights, setWeights] = useState<GymSet[]>();
  const [volumes, setVolumes] = useState<Volume[]>();
  const [metric, setMetric] = useState(Metrics.OneRepMax);
  const [period, setPeriod] = useState(Periods.Monthly);

  useEffect(() => {
    let difference = "-7 days";
    if (period === Periods.Monthly) difference = "-1 months";
    else if (period === Periods.Yearly) difference = "-1 years";

    let group = "%Y-%m-%d";
    if (period === Periods.Yearly) group = "%Y-%m";

    const builder = setRepo
      .createQueryBuilder()
      .select("STRFTIME('%Y-%m-%d', created)", "created")
      .addSelect("unit")
      .where("name = :name", { name: params.name })
      .andWhere("NOT hidden")
      .andWhere("DATE(created) >= DATE('now', 'weekday 0', :difference)", {
        difference,
      })
      .groupBy("name")
      .addGroupBy(`STRFTIME('${group}', created)`);

    switch (metric) {
      case Metrics.Best:
        builder
          .addSelect("ROUND(MAX(weight), 2)", "weight")
          .getRawMany()
          .then(setWeights);
        break;
      case Metrics.Volume:
        builder
          .addSelect("ROUND(SUM(weight * reps), 2)", "value")
          .getRawMany()
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
          .then((newWeights) => {
            console.log({ weights: newWeights });
            setWeights(newWeights);
          });
    }
  }, [params.name, metric, period]);

  const charts = useMemo(() => {
    let periodFormat = "do";
    if (period === Periods.Weekly) periodFormat = "iii";
    else if (period === Periods.Yearly) periodFormat = "P";

    if (metric === Metrics.Volume && Number(volumes?.length) > 0)
      return (
        <Chart
          data={volumes.map((volume) => volume.value)}
          labels={volumes.map((volume) =>
            format(new Date(volume.created), periodFormat)
          )}
        />
      );
    if (
      (metric === Metrics.Best || metric === Metrics.OneRepMax) &&
      Number(weights?.length) > 0
    )
      return (
        <Chart
          data={weights.map((set) => set.weight)}
          labels={weights.map((set) =>
            format(new Date(set.created), periodFormat)
          )}
        />
      );

    return <List.Item title="No data yet." />;
  }, [volumes, weights, metric, period]);

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
      <View style={{ padding: PADDING }}>
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
            { value: Periods.Yearly, label: Periods.Yearly },
          ]}
          onChange={(value) => setPeriod(value as Periods)}
          value={period}
        />
        <View style={{ paddingTop: PADDING }}>
          {(weights || volumes) && charts}
        </View>
      </View>
    </>
  );
}
