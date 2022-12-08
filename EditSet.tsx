import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import {format} from 'date-fns'
import {useCallback, useRef, useState} from 'react'
import {NativeModules, TextInput, View} from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import {Button, Card, TouchableRipple} from 'react-native-paper'
import ConfirmDialog from './ConfirmDialog'
import {MARGIN, PADDING} from './constants'
import {getNow, setRepo, settingsRepo} from './db'
import GymSet from './gym-set'
import {HomePageParams} from './home-page-params'
import MassiveInput from './MassiveInput'
import Settings from './settings'
import StackHeader from './StackHeader'
import {toast} from './toast'

export default function EditSet() {
  const {params} = useRoute<RouteProp<HomePageParams, 'EditSet'>>()
  const {set} = params
  const navigation = useNavigation()
  const [settings, setSettings] = useState<Settings>({} as Settings)
  const [name, setName] = useState(set.name)
  const [reps, setReps] = useState(set.reps?.toString())
  const [weight, setWeight] = useState(set.weight?.toString())
  const [newImage, setNewImage] = useState(set.image)
  const [unit, setUnit] = useState(set.unit)
  const [showRemove, setShowRemove] = useState(false)
  const [removeImage, setRemoveImage] = useState(false)
  const weightRef = useRef<TextInput>(null)
  const repsRef = useRef<TextInput>(null)
  const unitRef = useRef<TextInput>(null)

  const [selection, setSelection] = useState({
    start: 0,
    end: set.reps?.toString().length,
  })

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({where: {}}).then(setSettings)
    }, []),
  )

  const startTimer = useCallback(
    async (value: string) => {
      if (!settings.alarm) return
      const first = await setRepo.findOne({where: {name: value}})
      const milliseconds =
        (first?.minutes ?? 3) * 60 * 1000 + (first?.seconds ?? 0) * 1000
      const {vibrate, sound, noSound} = settings
      const args = [milliseconds, vibrate, sound, noSound]
      NativeModules.AlarmModule.timer(...args)
    },
    [settings],
  )

  const added = useCallback(
    async (value: GymSet) => {
      startTimer(value.name)
      console.log(`${EditSet.name}.add`, {set: value})
      if (!settings.notify) return
      if (
        value.weight > set.weight ||
        (value.reps > set.reps && value.weight === set.weight)
      )
        toast("Great work King! That's a new record.")
    },
    [startTimer, set, settings],
  )

  const handleSubmit = async () => {
    console.log(`${EditSet.name}.handleSubmit:`, {set, uri: newImage, name})
    if (!name) return
    let image = newImage
    if (!newImage && !removeImage)
      image = await setRepo.findOne({where: {name}}).then(s => s?.image)

    console.log(`${EditSet.name}.handleSubmit:`, {image})
    const [{now}] = await getNow()
    const saved = await setRepo.save({
      id: set.id,
      name,
      created: set.created || now,
      reps: Number(reps),
      weight: Number(weight),
      unit,
      image,
      minutes: Number(set.minutes ?? 3),
      seconds: Number(set.seconds ?? 30),
      sets: set.sets ?? 3,
      hidden: false,
    })
    if (typeof set.id !== 'number') added(saved)
    navigation.goBack()
  }

  const changeImage = useCallback(async () => {
    const {fileCopyUri} = await DocumentPicker.pickSingle({
      type: DocumentPicker.types.images,
      copyTo: 'documentDirectory',
    })
    if (fileCopyUri) setNewImage(fileCopyUri)
  }, [])

  const handleRemove = useCallback(async () => {
    setNewImage('')
    setRemoveImage(true)
    setShowRemove(false)
  }, [])

  return (
    <>
      <StackHeader title="Edit set" />

      <View style={{padding: PADDING, flex: 1}}>
        <MassiveInput
          label="Name"
          value={name}
          onChangeText={setName}
          autoCorrect={false}
          autoFocus={!name}
          onSubmitEditing={() => repsRef.current?.focus()}
        />

        <MassiveInput
          label="Reps"
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
          onSubmitEditing={() => weightRef.current?.focus()}
          selection={selection}
          onSelectionChange={e => setSelection(e.nativeEvent.selection)}
          autoFocus={!!name}
          innerRef={repsRef}
        />

        <MassiveInput
          label="Weight"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          onSubmitEditing={handleSubmit}
          innerRef={weightRef}
        />

        {settings.showUnit && (
          <MassiveInput
            autoCapitalize="none"
            label="Unit"
            value={unit}
            onChangeText={setUnit}
            innerRef={unitRef}
          />
        )}

        {typeof set.id === 'number' && settings.showDate && (
          <MassiveInput
            label="Created"
            disabled
            value={format(new Date(set.created), settings.date)}
          />
        )}

        {settings.images && newImage && (
          <TouchableRipple
            style={{marginBottom: MARGIN}}
            onPress={changeImage}
            onLongPress={() => setShowRemove(true)}>
            <Card.Cover source={{uri: newImage}} />
          </TouchableRipple>
        )}

        {settings.images && !newImage && (
          <Button
            style={{marginBottom: MARGIN}}
            onPress={changeImage}
            icon="add-photo-alternate">
            Image
          </Button>
        )}
      </View>

      <Button
        disabled={!name}
        mode="contained"
        icon="save"
        style={{margin: MARGIN}}
        onPress={handleSubmit}>
        Save
      </Button>

      <ConfirmDialog
        title="Remove image"
        onOk={handleRemove}
        show={showRemove}
        setShow={setShowRemove}>
        Are you sure you want to remove the image?
      </ConfirmDialog>
    </>
  )
}
