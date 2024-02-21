import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { Appbar, IconButton } from "react-native-paper";
import { DrawerParams } from "./drawer-params";

export default function DrawerHeader({
  name,
  children,
  ids,
  unSelect,
}: {
  name: string;
  children?: JSX.Element | JSX.Element[];
  ids?: number[],
  unSelect?: () => void,
}) {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParams>>();

  return (
    <Appbar.Header>
      {ids && ids.length > 0 ? (<IconButton icon="arrow-left" onPress={unSelect} />) : (
        <IconButton icon="menu" onPress={navigation.openDrawer} />
      )}
      <Appbar.Content title={name} />
      {children}
    </Appbar.Header>
  );
}
