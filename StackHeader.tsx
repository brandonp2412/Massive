import { useNavigation } from "@react-navigation/native";
import { Appbar, IconButton } from "react-native-paper";

export default function StackHeader({
  title,
  children,
}: {
  title: string;
  children?: JSX.Element | JSX.Element[];
}) {
  const navigation = useNavigation();

  return (
    <Appbar.Header>
      <IconButton icon="arrow-left" onPress={navigation.goBack} />
      <Appbar.Content title={title} />
      {children}
    </Appbar.Header>
  );
}
