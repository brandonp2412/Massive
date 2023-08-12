import { DefaultTheme, MD3DarkTheme } from "react-native-paper";

export const lightColors = [
  { hex: MD3DarkTheme.colors.primary, name: "Purple" },
  { hex: "#B3E5FC", name: "Blue" },
  { hex: "#FA8072", name: "Salmon" },
  { hex: "#FFC0CB", name: "Pink" },
  { hex: "#E9DCC9", name: "Linen" },
];

export const darkColors = [
  { hex: DefaultTheme.colors.primary, name: "Purple" },
  { hex: "#0051a9", name: "Blue" },
  { hex: "#000000", name: "Black" },
  { hex: "#863c3c", name: "Red" },
  { hex: "#1c6000", name: "Kermit" },
];

export const colorShade = (color: any, amount: number) => {
  color = color.replace(/^#/, "");
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }

  let [r, g, b] = color.match(/.{2}/g);
  [r, g, b] = [
    parseInt(r, 16) + amount,
    parseInt(g, 16) + amount,
    parseInt(b, 16) + amount,
  ];

  r = Math.max(Math.min(255, r), 0).toString(16);
  g = Math.max(Math.min(255, g), 0).toString(16);
  b = Math.max(Math.min(255, b), 0).toString(16);

  const rr = (r.length < 2 ? "0" : "") + r;
  const gg = (g.length < 2 ? "0" : "") + g;
  const bb = (b.length < 2 ? "0" : "") + b;

  return `#${rr}${gg}${bb}`;
};
