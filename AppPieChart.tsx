import { useWindowDimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useTheme } from "react-native-paper";

export interface Option {
  value: number;
  label: string;
}

export default function AppPieChart({ options }: { options: Option[] }) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();

  const pieChartColors = [
    "#1f77b4", // Blue
    "#ff7f0e", // Orange
    "#2ca02c", // Green
    "#d62728", // Red
    "#9467bd", // Purple
    "#8c564b", // Brown
    "#e377c2", // Pink
    "#7f7f7f", // Gray
  ];

  const data = options.map((option, index) => ({
    name: option.label,
    value: option.value,
    color: pieChartColors[index],
    legendFontColor: colors.onSurface,
    legendFontSize: 15,
  }));

  return (
    <PieChart
      data={data}
      paddingLeft="0"
      width={width}
      height={220}
      chartConfig={{
        backgroundColor: "#e26a00",
        backgroundGradientFrom: "#fb8c00",
        backgroundGradientTo: "#ffa726",
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16,
        },
        propsForDots: {
          r: "6",
          strokeWidth: "2",
          stroke: "#ffa726",
        },
      }}
      accessor={"value"}
      backgroundColor={"transparent"}
    />
  );
}
