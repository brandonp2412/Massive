import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, NativeModules, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { ProgressCircle } from "react-native-svg-charts";
import AppFab from "./AppFab";
import { darkenRgba } from "./colors";
import { MARGIN, PADDING } from "./constants";
import { settingsRepo } from "./db";
import DrawerHeader from "./DrawerHeader";
import Settings from "./settings";
import useTimer from "./use-timer";

export interface TickEvent {
  minutes: string;
  seconds: string;
}

export default function TimerPage() {
  const { minutes, seconds } = useTimer();
  const [settings, setSettings] = useState<Settings>();
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({ where: {} }).then(setSettings);
    }, [])
  );

  const stop = () => {
    NativeModules.AlarmModule.stop();
  };

  const add = async () => {
    console.log(`${TimerPage.name}.add:`, settings);
    NativeModules.AlarmModule.add();
  };

  const progress = useMemo(() => {
    return (Number(minutes) * 60 + Number(seconds)) / 210;
  }, [minutes, seconds]);

  const left = useMemo(() => {
    return Dimensions.get("screen").width * 0.5 - 60;
  }, []);

  const backgroundColor = useMemo(() => {
    if (colors.primary.match(/rgba/)) return darkenRgba(colors.primary, 0.6);
    return colors.primary + "80";
  }, [colors.primary]);

  return (
    <>
      <DrawerHeader name="Timer" />
      <View style={{ flexGrow: 1, padding: PADDING }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 70, position: "absolute" }}>
            {minutes}:{seconds}
          </Text>
          <ProgressCircle
            style={{ height: 300, width: 300, marginBottom: MARGIN }}
            progress={progress}
            strokeWidth={10}
            progressColor={colors.primary}
            backgroundColor={backgroundColor}
          />
        </View>
      </View>
      <Button onPress={add} style={{ position: "absolute", top: "82%", left }}>
        Add 1 min
      </Button>
      <AppFab icon="stop" onPress={stop} />
    </>
  );
}
