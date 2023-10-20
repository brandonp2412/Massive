import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
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
  const [period, setPeriod] = useState(Periods.Monthly);

  useEffect(() => {
    let difference = "-7 days";
    if (period === Periods.Monthly) difference = "-1 months";
    else if (period === Periods.Yearly) difference = "-1 years";

    let group = "%Y-%m-%d";
    if (period === Periods.Yearly) group = "%Y-%m";

    weightRepo
      .createQueryBuilder()
      .select("STRFTIME('%Y-%m-%d', created)", "created")
      .addSelect("unit")
      .addSelect("value")
      .where("DATE(created) >= DATE('now', 'weekday 0', :difference)", {
        difference,
      })
      .groupBy(`STRFTIME('${group}', created)`)
      .getRawMany()
      .then(setWeights);
  }, [period]);

  const charts = useMemo(() => {
    if (weights?.length === 0) {
      return <List.Item title="No data yet." />;
    }

    return (
      <Chart
        yData={weights?.map((set) => set.value) || []}
        yFormat={(value) => `${value}${weights?.[0].unit}`}
        xData={weights || []}
        xFormat={(_value, index) =>
          format(new Date(weights?.[index].created), "d/M")
        }
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
      <View style={{ padding: PADDING }}>
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
        {charts}
      </View>
    </>
  );
}
