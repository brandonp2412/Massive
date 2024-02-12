import { DARK_COLORS, LIGHT_COLORS } from "./colors";

export const themeOptions = [
  { label: "System", value: "system", icon: 'cellphone' },
  { label: "Dark", value: "dark", icon: 'lightbulb-off-outline' },
  { label: "Light", value: "light", icon: 'lightbulb-outline' },
];

export const lightOptions = LIGHT_COLORS.map((color) => ({
  label: color.name,
  value: color.hex,
  color: color.hex,
}));

export const darkOptions = DARK_COLORS.map((color) => ({
  label: color.name,
  value: color.hex,
  color: color.hex,
}));
