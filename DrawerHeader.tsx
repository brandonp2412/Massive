import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { Appbar, IconButton } from "react-native-paper";
import { DrawerParamList } from "./drawer-param-list";

export default function DrawerHeader({
  name,
  children,
}: {
  name: string;
  children?: JSX.Element | JSX.Element[];
}) {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <Appbar.Header>
      <IconButton icon="menu" onPress={navigation.openDrawer} />
      <Appbar.Content title={name} />
      {children}
    </Appbar.Header>
  );
}
