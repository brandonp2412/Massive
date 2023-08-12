import { useColorScheme } from "react-native";
import { useTheme } from "./use-theme";

export default function useDark() {
  const dark = useColorScheme() === "dark";
  const { theme } = useTheme();

  if (theme === "dark") return true;
  if (theme === "light") return false;
  return dark;
}
