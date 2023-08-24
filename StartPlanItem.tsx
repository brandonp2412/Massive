import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  DeviceEventEmitter,
  GestureResponderEvent,
  ListRenderItemInfo,
  View,
} from "react-native";
import { List, Menu, RadioButton, useTheme } from "react-native-paper";
import { Like } from "typeorm";
import { GYM_SET_DELETED } from "./constants";
import CountMany from "./count-many";
import { getNow, setRepo } from "./db";
import { HomePageParams } from "./home-page-params";
import { PlanPageParams } from "./plan-page-params";
import { toast } from "./toast";

interface Props extends ListRenderItemInfo<CountMany> {
  onSelect: (index: number) => void;
  selected: number;
  onUndo: () => void;
}

export default function StartPlanItem(props: Props) {
  const { index, item, onSelect, selected, onUndo } = props;
  const { colors } = useTheme();
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const { navigate } = useNavigation<NavigationProp<PlanPageParams>>();
  const { navigate: navigateHome } =
    useNavigation<NavigationProp<HomePageParams>>();

  const undo = useCallback(async () => {
    const now = await getNow();
    const created = now.split("T")[0];
    const first = await setRepo.findOne({
      where: {
        name: item.name,
        hidden: 0 as any,
        created: Like(`${created}%`),
      },
      order: { created: "desc" },
    });
    setShowMenu(false);
    if (!first) return toast("Nothing to undo.");
    await setRepo.delete(first.id);
    DeviceEventEmitter.emit(GYM_SET_DELETED);
    onUndo();
  }, [setShowMenu, onUndo, item.name]);

  const longPress = useCallback(
    (e: GestureResponderEvent) => {
      setAnchor({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
      setShowMenu(true);
    },
    [setShowMenu, setAnchor]
  );

  const edit = useCallback(async () => {
    const now = await getNow();
    const created = now.split("T")[0];
    const first = await setRepo.findOne({
      where: {
        name: item.name,
        hidden: 0 as any,
        created: Like(`${created}%`),
      },
      order: { created: "desc" },
    });
    setShowMenu(false);
    if (!first) return toast("Nothing to edit.");
    navigate("EditSet", { set: first });
  }, [item.name, navigate]);

  const view = () => {
    setShowMenu(false);
    navigateHome("Sets", { search: item.name });
  };

  const left = useCallback(
    () => (
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <RadioButton
          onPress={() => onSelect(index)}
          value={index.toString()}
          status={selected === index ? "checked" : "unchecked"}
          color={colors.primary}
        />
      </View>
    ),
    [index, selected, colors.primary, onSelect]
  );

  const right = useCallback(
    () => (
      <View
        style={{
          width: "25%",
          justifyContent: "center",
        }}
      >
        <Menu
          anchor={anchor}
          visible={showMenu}
          onDismiss={() => setShowMenu(false)}
        >
          <Menu.Item leadingIcon="visibility" onPress={view} title="View" />
          <Menu.Item leadingIcon="edit" onPress={edit} title="Edit" />
          <Menu.Item leadingIcon="undo" onPress={undo} title="Undo" />
        </Menu>
      </View>
    ),
    [anchor, showMenu, edit, undo]
  );

  return (
    <List.Item
      onLongPress={longPress}
      title={item.name}
      description={
        item.sets ? `${item.total} / ${item.sets}` : item.total.toString()
      }
      onPress={() => onSelect(index)}
      left={left}
      right={right}
    />
  );
}
