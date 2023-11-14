import { useColorScheme } from "react-native";
import { useAppTheme } from "./use-theme";

export default function useDark() {
  const dark = useColorScheme() === "dark";
  const { theme } = useAppTheme();

  if (theme === "dark") return true;
  if (theme === "light") return false;
  return dark;
}
