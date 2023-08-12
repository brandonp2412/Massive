import { createContext, useContext } from "react";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

export const ThemeContext = createContext<{
  theme: string;
  lightColor: string;
  setTheme: (value: string) => void;
  setLightColor: (value: string) => void;
  darkColor: string;
  setDarkColor: (value: string) => void;
}>({
  theme: "system",
  lightColor: MD3DarkTheme.colors.primary,
  setTheme: () => null,
  setLightColor: () => null,
  darkColor: MD3LightTheme.colors.primary,
  setDarkColor: () => null,
});

export function useTheme() {
  return useContext(ThemeContext);
}
