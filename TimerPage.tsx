import React, {useEffect, useMemo, useState} from 'react'
import {
  Dimensions,
  NativeEventEmitter,
  NativeModules,
  StyleSheet,
  View,
} from 'react-native'
import {Button, Text} from 'react-native-paper'
import {ProgressCircle} from 'react-native-svg-charts'
import {MARGIN, PADDING} from './constants'
import {settingsRepo} from './db'
import DrawerHeader from './DrawerHeader'
import MassiveFab from './MassiveFab'
import Settings from './settings'
import {useTheme} from './use-theme'
import {useTheme as usePaperTheme} from 'react-native-paper'

interface TickEvent {
  minutes: string
  seconds: string
}

export default function TimerPage() {
  const [minutes, setMinutes] = useState('00')
  const [seconds, setSeconds] = useState('00')
  const [settings, setSettings] = useState<Settings>()
  const {color} = useTheme()
  const {colors} = usePaperTheme()

  useEffect(() => {
    settingsRepo.findOne({where: {}}).then(setSettings)
    const emitter = new NativeEventEmitter()
    const listener = emitter.addListener('tick', (event: TickEvent) => {
      console.log(`${TimerPage.name}.tick:`, {event})
      setMinutes(event.minutes)
      setSeconds(event.seconds)
    })
    return listener.remove
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

  const top = useMemo(() => {
    return Dimensions.get('screen').height * 0.5 - 45
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
            progressColor={color}
            backgroundColor={colors.placeholder}
            strokeWidth={10}
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