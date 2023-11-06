import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Text } from "react-native";
import { List } from "react-native-paper";
import { DARK_RIPPLE, LIGHT_RIPPLE } from "./constants";
import { setRepo } from "./db";
import { defaultSet } from "./gym-set";
import { Plan } from "./plan";
import { DAYS } from "./days";
import useDark from "./use-dark";
import { StackParams } from "./AppStack";

export default function PlanItem({
  item,
  setIds,
  ids,
}: {
  item: Plan;
  ids: number[];
  setIds: (value: number[]) => void;
}) {
  const [today, setToday] = useState<string>();
  const dark = useDark();
  const days = useMemo(() => item.days.split(","), [item.days]);
  const navigation = useNavigation<NavigationProp<StackParams>>();

  useFocusEffect(
    useCallback(() => {
      const newToday = DAYS[new Date().getDay()];
      setToday(newToday);
    }, [])
  );

  const start = useCallback(async () => {
    const workout = item.workouts.split(",")[0];
    let first = await setRepo.findOne({
      where: { name: workout },
      order: { created: "desc" },
    });
    if (!first) first = { ...defaultSet, name: workout };
    delete first.id;
    if (ids.length === 0) {
      return navigation.navigate("StartPlan", { plan: item, first });
    }
    const removing = ids.find((id) => id === item.id);
    if (removing) setIds(ids.filter((id) => id !== item.id));
    else setIds([...ids, item.id]);
  }, [ids, setIds, item, navigation]);

  const longPress = useCallback(() => {
    if (ids.length > 0) return;
    setIds([item.id]);
  }, [ids.length, item.id, setIds]);

  const currentDays = days.map((day, index) => (
    <Text key={day}>
      {day === today ? (
        <Text
          style={{
            fontWeight: "bold",
            textDecorationLine: "underline",
          }}
        >
          {day}
        </Text>
      ) : (
        day
      )}
      {index === days.length - 1 ? "" : ", "}
    </Text>
  ));

  const title = useMemo(
    () =>
      item.title ? (
        <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
      ) : (
        currentDays
      ),
    [item.title, currentDays]
  );

  const description = useMemo(
    () => (item.title ? currentDays : item.workouts.replace(/,/g, ", ")),
    [item.title, currentDays, item.workouts]
  );

  const backgroundColor = useMemo(() => {
    if (!ids.includes(item.id)) return;
    if (dark) return DARK_RIPPLE;
    return LIGHT_RIPPLE;
  }, [dark, ids, item.id]);

  return (
    <List.Item
      onPress={start}
      title={title}
      description={description}
      onLongPress={longPress}
      style={{ backgroundColor }}
    />
  );
}
