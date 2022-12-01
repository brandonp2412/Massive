import {darkColors, lightColors} from './colors'

export const themeOptions = [
  {label: 'Follow system theme', value: 'system'},
  {label: 'Dark theme', value: 'dark'},
  {label: 'Light theme', value: 'light'},
]

export const lightOptions = lightColors.map(color => ({
  label: color.name,
  value: color.hex,
  color: color.hex,
}))

export const darkOptions = darkColors.map(color => ({
  label: color.name,
  value: color.hex,
  color: color.hex,
}))
