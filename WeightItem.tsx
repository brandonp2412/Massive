import { NavigationProp, useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { useCallback } from "react";
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

  const description = useCallback(() => {
    return <Text>{format(new Date(item.created), settings.date || "P")}</Text>;
  }, [item.created, settings.date]);

  return (
    <List.Item
      onPress={press}
      title={`${item.value}${item.unit || "kg"}`}
      description={description}
    />
  );
}
