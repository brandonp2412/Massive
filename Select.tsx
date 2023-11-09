import React, { useCallback, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { IconButton, Menu, useTheme } from "react-native-paper";
import AppInput from "./AppInput";

export interface Item {
  value: string;
  label: string;
  color?: string;
}

function Select({
  value,
  onChange,
  items,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  items: Item[];
  label?: string;
}) {
  const [show, setShow] = useState(false);
  const { colors } = useTheme();
  let menuButton: React.Ref<View> = null;

  const selected = useMemo(
    () => items.find((item) => item.value === value) || items[0],
    [items, value]
  );

  const press = useCallback(
    (newValue: string) => {
      onChange(newValue);
      setShow(false);
    },
    [onChange]
  );

  return (
    <Menu
      visible={show}
      onDismiss={() => setShow(false)}
      anchor={
        <View>
          <Pressable onPress={() => setShow(true)}>
            <AppInput label={label} value={selected.label} editable={false} />
          </Pressable>
          <View
            style={{ position: "absolute", right: 0, flexDirection: "row" }}
          >
            <IconButton
              ref={menuButton}
              icon="menu-down"
              onPress={() => setShow(true)}
            />
          </View>
        </View>
      }
    >
      {items.map((item) => (
        <Menu.Item
          title={item.label}
          key={item.value}
          onPress={() => press(item.value)}
          titleStyle={{ color: item.color || colors.onSurface }}
        />
      ))}
    </Menu>
  );
}

export default React.memo(Select);
