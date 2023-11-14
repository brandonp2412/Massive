import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { View, useColorScheme } from "react-native";
import {
  MD3DarkTheme as PaperDarkTheme,
  MD3LightTheme as PaperDefaultTheme,
  Provider as PaperProvider,
  Text,
} from "react-native-paper";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import AppSnack from "./AppSnack";
import AppStack from "./AppStack";
import { AppDataSource } from "./data-source";
import { settingsRepo } from "./db";
import { ThemeContext } from "./use-theme";
import { MARGIN } from "./constants";

export const CombinedDefaultTheme = {
  ...NavigationDefaultTheme,
  ...PaperDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...PaperDefaultTheme.colors,
  },
};

export const CombinedDarkTheme = {
  ...NavigationDarkTheme,
  ...PaperDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...PaperDarkTheme.colors,
  },
};

const App = () => {
  console.log("Re rendered app");
  const systemTheme = useColorScheme();

  const [appSettings, setAppSettings] = useState({
    startup: undefined,
    theme: "system",
    lightColor: CombinedDefaultTheme.colors.primary,
    darkColor: CombinedDarkTheme.colors.primary,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (!AppDataSource.isInitialized)
        await AppDataSource.initialize().catch((e) => setError(e.toString()));
      const gotSettings = await settingsRepo.findOne({ where: {} });
      console.log({ gotSettings });
      setAppSettings({
        startup: gotSettings.startup,
        theme: gotSettings.theme,
        lightColor:
          gotSettings.lightColor || CombinedDefaultTheme.colors.primary,
        darkColor: gotSettings.darkColor || CombinedDarkTheme.colors.primary,
      });
    })();
  }, []);

  const paperTheme = useMemo(() => {
    const darkTheme = {
      ...CombinedDarkTheme,
      colors: {
        ...CombinedDarkTheme.colors,
        primary: appSettings.darkColor,
      },
    };
    const lightTheme = {
      ...CombinedDefaultTheme,
      colors: {
        ...CombinedDefaultTheme.colors,
        primary: appSettings.lightColor,
      },
    };
    let theme = systemTheme === "dark" ? darkTheme : lightTheme;
    if (appSettings.theme === "dark") theme = darkTheme;
    else if (appSettings.theme === "light") theme = lightTheme;
    return theme;
  }, [systemTheme, appSettings]);

  return (
    <PaperProvider
      theme={paperTheme}
      settings={{ icon: (props) => <MaterialIcon {...props} /> }}
    >
      <NavigationContainer theme={paperTheme}>
        {error && (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{
                color: systemTheme === "dark" ? "white" : "black",
                margin: MARGIN,
              }}
            >
              Database failed to initialize: {error}
            </Text>
          </View>
        )}
        {appSettings.startup !== undefined && (
          <ThemeContext.Provider
            value={{
              theme: appSettings.theme,
              setTheme: (theme) => setAppSettings({ ...appSettings, theme }),
              lightColor: appSettings.lightColor,
              setLightColor: (color) =>
                setAppSettings({ ...appSettings, lightColor: color }),
              darkColor: appSettings.darkColor,
              setDarkColor: (color) =>
                setAppSettings({ ...appSettings, darkColor: color }),
            }}
          >
            <AppStack startup={appSettings.startup} />
          </ThemeContext.Provider>
        )}
      </NavigationContainer>

      <AppSnack textColor={paperTheme.colors.background} />
    </PaperProvider>
  );
};

export default App;
