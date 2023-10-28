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
    "#FF7F50", // Coral
    "#1E90FF", // Dodger Blue
    "#32CD32", // Lime Green
    "#BA55D3", // Medium Orchid
    "#FFD700", // Gold
    "#48D1CC", // Medium Turquoise
    "#FF69B4", // Hot Pink
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
