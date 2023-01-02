import {darkColors, lightColors} from './colors'

export const themeOptions = [
  {label: 'System', value: 'system'},
  {label: 'Dark', value: 'dark'},
  {label: 'Light', value: 'light'},
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
