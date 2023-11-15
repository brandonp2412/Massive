import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  GestureResponderEvent,
  ListRenderItemInfo,
  NativeModules,
  View,
} from "react-native";
import { List, Menu, RadioButton, useTheme } from "react-native-paper";
import { Like } from "typeorm";
import { StackParams } from "./AppStack";
import CountMany from "./count-many";
import { getNow, setRepo } from "./db";
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
  const { navigate: stackNavigate } =
    useNavigation<NavigationProp<StackParams>>();

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
    NativeModules.AlarmModule.stop();
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
    stackNavigate("EditSet", { set: first });
  }, [item.name, stackNavigate]);

  const view = useCallback(() => {
    setShowMenu(false);
    stackNavigate("ViewSetList", { name: item.name });
  }, [item.name, stackNavigate]);

  const graph = useCallback(() => {
    setShowMenu(false);
    stackNavigate("ViewGraph", { name: item.name });
  }, [item.name, stackNavigate]);

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
          <Menu.Item leadingIcon="eye-outline" onPress={view} title="Peek" />
          <Menu.Item
            leadingIcon="chart-bell-curve-cumulative"
            onPress={graph}
            title="Graph"
          />
          <Menu.Item leadingIcon="pencil" onPress={edit} title="Edit" />
          <Menu.Item leadingIcon="undo" onPress={undo} title="Undo" />
        </Menu>
      </View>
    ),
    [anchor, showMenu, edit, undo, view, graph]
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
