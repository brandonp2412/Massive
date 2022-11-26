import {DarkTheme, DefaultTheme} from 'react-native-paper'

export const lightColors = [
  DarkTheme.colors.primary,
  '#B3E5FC',
  '#FA8072',
  '#FFC0CB',
  '#E9DCC9',
  '#BBA1CE',
]

export const darkColors = [
  DefaultTheme.colors.primary,
  '#007AFF',
  '#000000',
  '#CD5C5C',
]

export const colorShade = (color: any, amount: number) => {
  color = color.replace(/^#/, '')
  if (color.length === 3)
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2]

  let [r, g, b] = color.match(/.{2}/g)
  ;[r, g, b] = [
    parseInt(r, 16) + amount,
    parseInt(g, 16) + amount,
    parseInt(b, 16) + amount,
  ]

  r = Math.max(Math.min(255, r), 0).toString(16)
  g = Math.max(Math.min(255, g), 0).toString(16)
  b = Math.max(Math.min(255, b), 0).toString(16)

  const rr = (r.length < 2 ? '0' : '') + r
  const gg = (g.length < 2 ? '0' : '') + g
  const bb = (b.length < 2 ? '0' : '') + b

  return `#${rr}${gg}${bb}`
}
