import React, {useEffect, useMemo, useState} from 'react'
import {Dimensions, NativeModules, View} from 'react-native'
import {Button, Text, useTheme} from 'react-native-paper'
import {ProgressCircle} from 'react-native-svg-charts'
import {MARGIN, PADDING} from './constants'
import {settingsRepo} from './db'
import DrawerHeader from './DrawerHeader'
import MassiveFab from './MassiveFab'
import Settings from './settings'
import useTimer from './use-timer'

export interface TickEvent {
  minutes: string
  seconds: string
}

export default function TimerPage() {
  const {minutes, seconds} = useTimer()
  const [settings, setSettings] = useState<Settings>()
  const {colors} = useTheme()

  useEffect(() => {
    settingsRepo.findOne({where: {}}).then(setSettings)
  }, [])

  const stop = () => {
    NativeModules.AlarmModule.stop()
  }

  const add = async () => {
    const params = [settings.vibrate, settings.sound, settings.noSound]
    NativeModules.AlarmModule.add(...params)
  }

  const progress = useMemo(() => {
    return (Number(minutes) * 60 + Number(seconds)) / 210
  }, [minutes, seconds])

  const left = useMemo(() => {
    return Dimensions.get('screen').width * 0.5 - 85
  }, [])

  return (
    <>
      <DrawerHeader name="Timer" />
      <View style={{flexGrow: 1, padding: PADDING}}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View>
            <Text style={{fontSize: 70, top: 150}}>
              {minutes}:{seconds}
            </Text>
          </View>
          <ProgressCircle
            style={{height: 300, width: 500, marginBottom: MARGIN, top: -50}}
            progress={progress}
            strokeWidth={10}
            progressColor={colors.text}
            backgroundColor={colors.placeholder}
          />
        </View>
      </View>
      <Button
        onPress={add}
        style={{position: 'absolute', top: '85%', left: left + 25}}>
        Add 1 min
      </Button>
      <MassiveFab icon="stop" onPress={stop} />
    </>
  )
}
