import React, {ComponentProps, Ref} from 'react'
import {TextInput} from 'react-native-paper'
import {CombinedDefaultTheme} from './App'
import {MARGIN} from './constants'
import useDark from './use-dark'

function AppInput(
  props: Partial<ComponentProps<typeof TextInput>> & {
    innerRef?: Ref<any>
  },
) {
  const dark = useDark()

  return (
    <TextInput
      selectionColor={dark ? '#2A2A2A' : CombinedDefaultTheme.colors.border}
      style={{marginBottom: MARGIN, minWidth: 100}}
      selectTextOnFocus
      ref={props.innerRef}
      blurOnSubmit={false}
      {...props}
    />
  )
}

export default React.memo(AppInput)
