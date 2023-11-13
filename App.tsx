import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import {
  MD3DarkTheme as PaperDarkTheme,
  MD3LightTheme as PaperDefaultTheme,
  ProgressBar,
  Provider as PaperProvider,
  Snackbar,
} from "react-native-paper";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import AppStack from "./AppStack";
import { AppDataSource } from "./data-source";
import { settingsRepo } from "./db";
import { emitter } from "./emitter";
import { TickEvent } from "./TimerPage";
import { TOAST } from "./toast";
import { ThemeContext } from "./use-theme";
import Settings from "./settings";
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
  const phoneTheme = useColorScheme();
  const [initialized, setInitialized] = useState(false);
  const [snackbar, setSnackbar] = useState("");
  const [appTheme, setAppTheme] = useState("system");
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<Settings>();

  const [lightColor, setLightColor] = useState<string>(
    CombinedDefaultTheme.colors.primary
  );

  const [darkColor, setDarkColor] = useState<string>(
    CombinedDarkTheme.colors.primary
  );

  useEffect(() => {
    (async () => {
      if (!AppDataSource.isInitialized) await AppDataSource.initialize();
      const gotSettings = await settingsRepo.findOne({ where: {} });
      console.log({ gotSettings });
      setSettings(gotSettings);
      setAppTheme(gotSettings.theme);
      if (gotSettings.lightColor) setLightColor(gotSettings.lightColor);
      if (gotSettings.darkColor) setDarkColor(gotSettings.darkColor);
      setInitialized(true);
    })();

    const descriptions = [
      emitter.addListener(TOAST, ({ value }: { value: string }) => {
        setSnackbar(value);
      }),
      emitter.addListener("tick", (event: TickEvent) => {
        setProgress((Number(event.minutes) * 60 + Number(event.seconds)) / 210);
      }),
    ];
    return () => descriptions.forEach((description) => description.remove());
  }, []);

  const paperTheme = useMemo(() => {
    const darkTheme = lightColor
      ? {
          ...CombinedDarkTheme,
          colors: { ...CombinedDarkTheme.colors, primary: darkColor },
        }
      : CombinedDarkTheme;
    const lightTheme = lightColor
      ? {
          ...CombinedDefaultTheme,
          colors: { ...CombinedDefaultTheme.colors, primary: lightColor },
        }
      : CombinedDefaultTheme;
    let value = phoneTheme === "dark" ? darkTheme : lightTheme;
    if (appTheme === "dark") value = darkTheme;
    else if (appTheme === "light") value = lightTheme;
    return value;
  }, [phoneTheme, appTheme, lightColor, darkColor]);

  return (
    <PaperProvider
      theme={paperTheme}
      settings={{ icon: (props) => <MaterialIcon {...props} /> }}
    >
      <NavigationContainer theme={paperTheme}>
        {initialized && (
          <ThemeContext.Provider
            value={{
              theme: appTheme,
              setTheme: setAppTheme,
              lightColor,
              setLightColor,
              darkColor,
              setDarkColor,
            }}
          >
            <AppStack settings={settings} />
          </ThemeContext.Provider>
        )}
      </NavigationContainer>

      <Snackbar
        duration={3000}
        onDismiss={() => setSnackbar("")}
        visible={!!snackbar}
        action={{
          label: "Close",
          onPress: () => setSnackbar(""),
          textColor: paperTheme.colors.background,
        }}
      >
        {snackbar}
      </Snackbar>

      {progress > 0 && (
        <ProgressBar
          style={{
            position: "absolute",
            bottom: MARGIN / 2,
            left: MARGIN,
            right: MARGIN,
          }}
          progress={progress}
        />
      )}
    </PaperProvider>
  );
};

export default App;
