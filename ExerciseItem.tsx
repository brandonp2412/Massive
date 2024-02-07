import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useCallback, useMemo } from "react";
import { Image } from "react-native";
import { List, useTheme } from "react-native-paper";
import { StackParams } from "./AppStack";
import { DARK_RIPPLE, LIGHT_RIPPLE } from "./constants";
import GymSet from "./gym-set";

export default function ExerciseItem({
  item,
  setNames,
  names,
  images,
  alarm,
}: {
  item: GymSet;
  images: boolean;
  setNames: (value: string[]) => void;
  names: string[];
  alarm: boolean;
}) {
  const navigation = useNavigation<NavigationProp<StackParams>>();
  const { dark } = useTheme();

  const description = useMemo(() => {
    const seconds = item.seconds?.toString().padStart(2, "0");
    const time = ` x ${item.minutes || 0}:${seconds}`;
    if (alarm) return item.sets.toString() + time;
    return item.sets.toString();
  }, [item.sets, item.minutes, item.seconds, alarm]);

  const left = useCallback(() => {
    if (!images || !item.image) return null;
    return (
      <Image source={{ uri: item.image }} style={{ height: 75, width: 75 }} />
    );
  }, [item.image, images]);

  const long = () => {
    if (names.length > 0) return;
    setNames([item.name]);
  };

  const backgroundColor = useMemo(() => {
    if (!names.includes(item.name)) return;
    if (dark) return DARK_RIPPLE;
    return LIGHT_RIPPLE;
  }, [dark, names, item.name]);

  const press = () => {
    console.log(`${ExerciseItem.name}.press:`, { names });
    if (names.length === 0)
      return navigation.navigate("EditExercise", { gymSet: item });
    const removing = names.find((name) => name === item.name);
    if (removing) setNames(names.filter((name) => name !== item.name));
    else setNames([...names, item.name]);
  };

  return (
    <List.Item
      onPress={press}
      title={item.name}
      description={description}
      onLongPress={long}
      left={left}
      style={{ backgroundColor }}
    />
  );
}
