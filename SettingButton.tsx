import { View } from "react-native";
import { Button, Subheading } from "react-native-paper";
import { ITEM_PADDING } from "./constants";

export default function SettingButton({
  name: text,
  label,
  onPress,
}: {
  name: string;
  label?: string;
  onPress: () => void;
}) {
  if (label) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: ITEM_PADDING,
        }}
      >
        <Subheading style={{ width: 100 }}>{label}</Subheading>
        <Button onPress={onPress}>{text}</Button>
      </View>
    );
  }
  return (
    <Button style={{ alignSelf: "flex-start" }} onPress={onPress}>
      {text}
    </Button>
  );
}
