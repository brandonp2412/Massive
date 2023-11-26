import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { FileSystem } from "react-native-file-access";
import { IconButton, List } from "react-native-paper";
import Share from "react-native-share";
import { captureScreen } from "react-native-view-shot";
import Chart from "./Chart";
import { PADDING } from "./constants";
import { weightRepo } from "./db";
import { Periods } from "./periods";
import Select from "./Select";
import StackHeader from "./StackHeader";
import Weight from "./weight";

export default function ViewWeightGraph() {
  const [weights, setWeights] = useState<Weight[]>();
  const [period, setPeriod] = useState(Periods.TwoMonths);

  useEffect(() => {
    let difference = "-7 days";
    if (period === Periods.Monthly) difference = "-1 months";
    else if (period === Periods.TwoMonths) difference = "-2 months";
    else if (period === Periods.ThreeMonths) difference = "-3 months";
    else if (period === Periods.SixMonths) difference = "-6 months";
    else if (period === Periods.Yearly) difference = "-1 years";

    let group = "%Y-%m-%d";
    if (period === Periods.Yearly) group = "%Y-%m";

    weightRepo
      .createQueryBuilder()
      .select("STRFTIME('%Y-%m-%d', created)", "created")
      .addSelect("AVG(value) as value")
      .addSelect("unit")
      .where("DATE(created) >= DATE('now', 'weekday 0', :difference)", {
        difference,
      })
      .groupBy(`STRFTIME('${group}', created)`)
      .getRawMany()
      .then(setWeights);
  }, [period]);

  const charts = useMemo(() => {
    if (!weights) return;
    if (weights?.length === 0) {
      return <List.Item title="No data yet." />;
    }

    return (
      <Chart
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
          ]}
          onChange={(value) => setPeriod(value as Periods)}
          value={period}
        />
        {charts}
      </ScrollView>
    </>
  );
}
