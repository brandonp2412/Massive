import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { PADDING } from "./constants";
import useDark from "./use-dark";
import { useTheme } from "react-native-paper";

interface ChartProps {
  labels: string[];
  data: number[];
  preserve?: number;
}

export default function Chart({ labels, data, preserve = 3 }: ChartProps) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();

  const config: AbstractChartConfig = {
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.elevation.level1,
    color: () => colors.primary,
  };

  const pruned = useMemo(() => {
    const newPruned = [...labels];
    if (labels.length <= preserve + 2) return labels;

    let interval = Math.floor((labels.length - 2) / (preserve + 1));
    for (let i = 1; i < labels.length - 1; i++) {
      if ((i - 1) % interval !== 0 || i === 1) {
        newPruned[i] = "";
      }
    }
    return newPruned;
  }, [labels, preserve]);

  console.log({ labels, data, pruned, preserve });

  return (
    <LineChart
      height={400}
      width={width - 20}
      data={{
        labels: pruned,
        datasets: [
          {
            data,
          },
        ],
      }}
      chartConfig={config}
    />
  );
}
