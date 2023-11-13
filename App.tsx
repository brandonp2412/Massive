import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import {
  MD3DarkTheme as PaperDarkTheme,
  MD3LightTheme as PaperDefaultTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import AppSnack from "./AppSnack";
import AppStack from "./AppStack";
import TimerProgress from "./TimerProgress";
import { AppDataSource } from "./data-source";
import { settingsRepo } from "./db";
import { ThemeContext } from "./use-theme";

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
  const phoneTheme = useColorScheme();

  const [appSettings, setAppSettings] = useState({
    startup: undefined,
    theme: "system",
    lightColor: CombinedDefaultTheme.colors.primary,
    darkColor: CombinedDarkTheme.colors.primary,
  });

  useEffect(() => {
    (async () => {
      if (!AppDataSource.isInitialized) await AppDataSource.initialize();
      const gotSettings = await settingsRepo.findOne({ where: {} });
      console.log({ gotSettings });
      setAppSettings({
        startup: gotSettings.startup,
        theme: gotSettings.theme,
        lightColor: gotSettings.lightColor,
        darkColor: gotSettings.darkColor,
      });
    })();
  }, []);

  const paperTheme = useMemo(() => {
    const darkTheme = appSettings.darkColor
      ? {
          ...CombinedDarkTheme,
          colors: {
            ...CombinedDarkTheme.colors,
            primary: appSettings.darkColor,
          },
        }
      : CombinedDarkTheme;
    const lightTheme = appSettings.lightColor
      ? {
          ...CombinedDefaultTheme,
          colors: {
            ...CombinedDefaultTheme.colors,
            primary: appSettings.lightColor,
          },
        }
      : CombinedDefaultTheme;
    let value = phoneTheme === "dark" ? darkTheme : lightTheme;
    if (appSettings.theme === "dark") value = darkTheme;
    else if (appSettings.theme === "light") value = lightTheme;
    return value;
  }, [phoneTheme, appSettings]);

  return (
    <PaperProvider
      theme={paperTheme}
      settings={{ icon: (props) => <MaterialIcon {...props} /> }}
    >
      <NavigationContainer theme={paperTheme}>
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
      <TimerProgress />
    </PaperProvider>
  );
};

export default App;
