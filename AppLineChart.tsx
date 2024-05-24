import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { useTheme } from "react-native-paper";

interface ChartProps {
  labels: string[];
  data: number[];
}

export default function AppLineChart({ labels, data }: ChartProps) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();

  const config: AbstractChartConfig = {
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.elevation.level1,
    color: () => colors.primary,
  };

  const pruned = useMemo(() => {
    if (labels.length < 3) return labels;
    const newPruned = [labels[0]];
    const centerIndex = Math.floor(labels.length / 2);
    for (let i = 1; i < labels.length - 1; i++) {
      if (i === centerIndex) newPruned[i] = labels[i];
      else newPruned[i] = "";
    }
    newPruned.push(labels[labels.length - 1]);
    return newPruned;
  }, [labels]);

  return (
    <LineChart
      height={400}
      width={width - 20}
      data={{
        labels: pruned,
        datasets: [
          {
            data: data.map(d => isNaN(d) ? 0 : d),
          },
        ],
      }}
      bezier
      chartConfig={config}
    />
  );
}
