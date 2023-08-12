import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { GestureResponderEvent, Image } from "react-native";
import { List, Menu, Text } from "react-native-paper";
import ConfirmDialog from "./ConfirmDialog";
import { setRepo } from "./db";
import GymSet from "./gym-set";
import { WorkoutsPageParams } from "./WorkoutsPage";

export default function WorkoutItem({
  item,
  onRemove,
  images,
}: {
  item: GymSet;
  onRemove: () => void;
  images: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const [showRemove, setShowRemove] = useState("");
  const navigation = useNavigation<NavigationProp<WorkoutsPageParams>>();

  const remove = useCallback(async () => {
    await setRepo.delete({ name: item.name });
    setShowMenu(false);
    onRemove();
  }, [setShowMenu, onRemove, item.name]);

  const longPress = useCallback(
    (e: GestureResponderEvent) => {
      setAnchor({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
      setShowMenu(true);
    },
    [setShowMenu, setAnchor]
  );

  const description = useMemo(() => {
    const seconds = item.seconds?.toString().padStart(2, "0");
    return `${item.sets} x ${item.minutes || 0}:${seconds}`;
  }, [item]);

  const left = useCallback(() => {
    if (!images || !item.image) return null;
    return (
      <Image source={{ uri: item.image }} style={{ height: 75, width: 75 }} />
    );
  }, [item.image, images]);

  const right = useCallback(() => {
    return (
      <Text
        style={{
          alignSelf: "center",
        }}
      >
        <Menu
          anchor={anchor}
          visible={showMenu}
          onDismiss={() => setShowMenu(false)}
        >
          <Menu.Item
            leadingIcon="delete"
            onPress={() => {
              setShowRemove(item.name);
              setShowMenu(false);
            }}
            title="Delete"
          />
        </Menu>
      </Text>
    );
  }, [anchor, showMenu, item.name]);

  return (
    <>
      <List.Item
        onPress={() => navigation.navigate("EditWorkout", { value: item })}
        title={item.name}
        description={description}
        onLongPress={longPress}
        left={left}
        right={right}
      />
      <ConfirmDialog
        title={`Delete ${showRemove}`}
        show={!!showRemove}
        setShow={(show) => (show ? null : setShowRemove(""))}
        onOk={remove}
      >
        This irreversibly deletes ALL sets related to this workout. Are you
        sure?
      </ConfirmDialog>
    </>
  );
}
