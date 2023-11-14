import { NavigationProp, useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { useCallback, useMemo } from "react";
import { Image } from "react-native";
import { List, Text, useTheme } from "react-native-paper";
import { StackParams } from "./AppStack";
import { DARK_RIPPLE, LIGHT_RIPPLE } from "./constants";
import GymSet from "./gym-set";
import Settings from "./settings";

export default function SetItem({
  item,
  settings,
  ids,
  setIds,
  disablePress,
  customBg,
}: {
  item: GymSet;
  settings: Settings;
  ids: number[];
  setIds: (value: number[]) => void;
  disablePress?: boolean;
  customBg?: string;
}) {
  const { dark } = useTheme();
  const navigation = useNavigation<NavigationProp<StackParams>>();

  const longPress = useCallback(() => {
    if (ids.length > 0) return;
    setIds([item.id]);
  }, [ids.length, item.id, setIds]);

  const press = useCallback(() => {
    if (disablePress) return;
    if (ids.length === 0) return navigation.navigate("EditSet", { set: item });
    const removing = ids.find((id) => id === item.id);
    if (removing) setIds(ids.filter((id) => id !== item.id));
    else setIds([...ids, item.id]);
  }, [ids, item, navigation, setIds, disablePress]);

  const backgroundColor = useMemo(() => {
    if (!ids.includes(item.id)) return;
    if (dark) return DARK_RIPPLE;
    return LIGHT_RIPPLE;
  }, [dark, ids, item.id]);

  const image = useCallback(() => {
    if (!settings.images || !item.image) return null;
    return (
      <Image source={{ uri: item.image }} style={{ height: 75, width: 75 }} />
    );
  }, [item.image, settings.images]);

  return (
    <List.Item
      onPress={press}
      title={item.name}
      description={
        settings.showDate ? (
          <Text style={{ color: dark ? "#909090ff" : "#717171ff" }}>
            {format(new Date(item.created), settings.date || "P")}
          </Text>
        ) : null
      }
      onLongPress={longPress}
      style={{ backgroundColor: customBg || backgroundColor }}
      left={image}
      right={() => (
        <Text
          style={{
            alignSelf: "center",
            color: dark ? "#909090ff" : "#717171ff",
          }}
        >
          {`${item.reps} x ${item.weight}${item.unit || "kg"}`}
        </Text>
      )}
    />
  );
}
