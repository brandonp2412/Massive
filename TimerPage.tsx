import React, {useEffect, useState} from 'react'
import {NativeEventEmitter, NativeModules, StyleSheet, View} from 'react-native'
import {Button, Text, Title} from 'react-native-paper'
import {MARGIN, PADDING} from './constants'
import {settingsRepo} from './db'
import DrawerHeader from './DrawerHeader'
import MassiveFab from './MassiveFab'
import Settings from './settings'

interface TickEvent {
  minutes: string
  seconds: string
}

export default function TimerPage() {
  const [minutes, setMinutes] = useState('00')
  const [seconds, setSeconds] = useState('00')
  const [settings, setSettings] = useState<Settings>()

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
          <Text style={styles.text}>Remaining</Text>
          <Text style={styles.text}>
            {minutes}:{seconds}
          </Text>
          <Button onPress={add}>Add 1 min</Button>
        </View>
      </View>
      <MassiveFab icon="stop" onPress={stop} />
    </>
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: 32,
    marginBottom: MARGIN,
  },
})
