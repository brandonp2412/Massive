import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { NativeModules, View } from "react-native";
import { FAB, Text, useTheme } from "react-native-paper";
import AppFab from "./AppFab";
import DrawerHeader from "./DrawerHeader";
import { settingsRepo } from "./db";
import Settings from "./settings";
import useTimer from "./use-timer";

export interface TickEvent {
  minutes: string;
  seconds: string;
}

export default function TimerPage() {
  const { minutes, seconds, update } = useTimer();
  const [settings, setSettings] = useState<Settings>();
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({ where: {} }).then(setSettings);
    }, [])
  );

  const stop = () => {
    NativeModules.AlarmModule.stop();
    update();
  };

  const add = async () => {
    console.log(`${TimerPage.name}.add:`, settings);
    NativeModules.AlarmModule.add();
    update();
  };

  return (
    <>
      <DrawerHeader name="Timer" />
      <View
        style={{
          flex: 1,
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 70, position: "absolute" }}>
          {minutes}:{seconds}
        </Text>
      </View>

      <FAB
        icon="plus"
        onPress={add}
        style={{
          position: "absolute",
          left: 20,
          bottom: 20,
          backgroundColor: colors.primary,
        }}
        color={colors.background}
      />
      <AppFab icon="stop" onPress={stop} />
    </>
  );
}
