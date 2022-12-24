export const MARGIN = 10
export const PADDING = 10
export const ITEM_PADDING = 8
export const DARK_RIPPLE = '#444444'
export const LIGHT_RIPPLE = '#c2c2c2'

export const toSentenceCase = (camelCase: string) => {
  if (camelCase) {
    const result = camelCase.replace(/([A-Z])/g, ' $1')
    return result[0].toUpperCase() + result.substring(1).toLowerCase()
  }
  return ''
}
