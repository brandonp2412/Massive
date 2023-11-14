import { View, useColorScheme } from "react-native";

import { useCallback } from "react";
import { Dirs, FileSystem } from "react-native-file-access";
import { Button, Text } from "react-native-paper";
import { CombinedDarkTheme, CombinedDefaultTheme } from "./App";
import { MARGIN } from "./constants";
import { AppDataSource } from "./data-source";
import { settingsRepo } from "./db";

export default function FatalError({
  message,
  setAppSettings,
  setError,
}: {
  message: string;
  setAppSettings: (settings: {
    startup: any;
    theme: string;
    lightColor: string;
    darkColor: string;
  }) => void;
  setError: (message: string) => void;
}) {
  const systemTheme = useColorScheme();

  const resetDatabase = useCallback(async () => {
    await FileSystem.cp("/dev/null", Dirs.DatabaseDir + "/massive.db");
    await AppDataSource.initialize();
    const gotSettings = await settingsRepo.findOne({ where: {} });
    setAppSettings({
      startup: gotSettings.startup,
      theme: gotSettings.theme,
      lightColor: gotSettings.lightColor || CombinedDefaultTheme.colors.primary,
      darkColor: gotSettings.darkColor || CombinedDarkTheme.colors.primary,
    });
    setError("");
  }, [setAppSettings, setError]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          color: systemTheme === "dark" ? "white" : "black",
          margin: MARGIN,
        }}
      >
        Database failed to initialize: {message}
      </Text>
      <Button mode="contained" onPress={resetDatabase}>
        Reset database
      </Button>
    </View>
  );
}
