import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import {useCallback, useRef, useState} from 'react'
import {TextInput, View} from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import {Button, Card, TouchableRipple} from 'react-native-paper'
import ConfirmDialog from './ConfirmDialog'
import {MARGIN, PADDING} from './constants'
import {setRepo, settingsRepo} from './db'
import GymSet from './gym-set'
import {HomePageParams} from './home-page-params'
import MassiveInput from './MassiveInput'
import Settings from './settings'
import StackHeader from './StackHeader'

export default function EditSets() {
  const {params} = useRoute<RouteProp<HomePageParams, 'EditSets'>>()
  const {ids} = params
  const navigation = useNavigation()
  const [settings, setSettings] = useState<Settings>({} as Settings)
  const [name, setName] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [newImage, setNewImage] = useState('')
  const [unit, setUnit] = useState('')
  const [showRemove, setShowRemove] = useState(false)
  const weightRef = useRef<TextInput>(null)
  const repsRef = useRef<TextInput>(null)
  const unitRef = useRef<TextInput>(null)

  const [selection, setSelection] = useState({
    start: 0,
    end: 1,
  })

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({where: {}}).then(setSettings)
    }, []),
  )

  const handleSubmit = async () => {
    console.log(`${EditSets.name}.handleSubmit:`, {uri: newImage, name})
    const update: Partial<GymSet> = {}
    if (name) update.name = name
    if (reps) update.reps = Number(reps)
    if (weight) update.weight = Number(weight)
    if (unit) update.unit = unit
    if (newImage) update.image = newImage
    await setRepo.update(ids, update)
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
    setShowRemove(false)
  }, [])

  return (
    <>
      <StackHeader title={`Edit ${ids.length} sets`} />

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

        {settings.images && newImage && (
          <TouchableRipple
            style={{marginBottom: MARGIN}}
            onPress={changeImage}
            onLongPress={() => setShowRemove(true)}>
            <Card.Cover source={{uri: newImage}} />
          </TouchableRipple>
        )}
        <ConfirmDialog
          title="Remove image"
          onOk={handleRemove}
          show={showRemove}
          setShow={setShowRemove}>
          Are you sure you want to remove the image?
        </ConfirmDialog>

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
        mode="contained"
        icon="save"
        style={{margin: MARGIN}}
        onPress={handleSubmit}>
        Save
      </Button>
    </>
  )
}
