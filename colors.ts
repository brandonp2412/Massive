import { DefaultTheme, MD3DarkTheme } from "react-native-paper";

export const LIGHT_COLORS = [
  { hex: MD3DarkTheme.colors.primary, name: "Purple" },
  { hex: "#B3E5FC", name: "Blue" },
  { hex: "#FA8072", name: "Salmon" },
  { hex: "#FFC0CB", name: "Pink" },
  { hex: "#E9DCC9", name: "Linen" },
  { hex: "#9ACD32", name: "Yellow Green" },
  { hex: "#FFD700", name: "Gold" },
  { hex: "#00CED1", name: "Turquoise" },
];

export const DARK_COLORS = [
  { hex: DefaultTheme.colors.primary, name: "Purple" },
  { hex: "#0051a9", name: "Blue" },
  { hex: "#000000", name: "Black" },
  { hex: "#863c3c", name: "Brandy" },
  { hex: "#1c6000", name: "Kermit" },
  { hex: "#8A2BE2", name: "Violet" },
  { hex: "#6A5ACD", name: "Slate Blue" },
  { hex: "#CC3700", name: "Dark Orange" },
];

export function darkenRgba(rgba: string, amount: number) {
  let [r, g, b, a] = rgba.match(/\d+/g).map(Number);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, a - amount)})`;
}
