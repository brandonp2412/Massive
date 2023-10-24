import { NavigationProp, useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { useCallback, useMemo } from "react";
import { List, Text } from "react-native-paper";
import Settings from "./settings";
import Weight from "./weight";
import { WeightPageParams } from "./WeightPage";

export default function WeightItem({
  item,
  settings,
}: {
  item: Weight;
  settings: Settings;
}) {
  const navigation = useNavigation<NavigationProp<WeightPageParams>>();

  const press = useCallback(() => {
    navigation.navigate("EditWeight", { weight: item });
  }, [item, navigation]);

  const today = useMemo(() => {
    const now = new Date();
    const created = new Date(item.created);
    return (
      now.getFullYear() === created.getFullYear() &&
      now.getMonth() === created.getMonth() &&
      now.getDate() === created.getDate()
    );
  }, [item.created]);

  return (
    <List.Item
      onPress={press}
      title={`${item.value}${item.unit || "kg"}`}
      right={() => (
        <Text
          style={{
            alignSelf: "center",
            textDecorationLine: today ? "underline" : "none",
            fontWeight: today ? "bold" : "normal",
          }}
        >
          {format(new Date(item.created), settings.date || "P")}
        </Text>
      )}
    />
  );
}
