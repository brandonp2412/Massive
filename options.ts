import { DARK_COLORS, LIGHT_COLORS } from "./colors";

export const themeOptions = [
  { label: "System", value: "system" },
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
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
