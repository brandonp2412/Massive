import {format} from 'date-fns'
import {useCallback, useRef, useState} from 'react'
import {TextInput, View} from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import {Button, Card, TouchableRipple} from 'react-native-paper'
import ConfirmDialog from './ConfirmDialog'
import {MARGIN} from './constants'
import {getNow, setRepo} from './db'
import GymSet from './gym-set'
import MassiveInput from './MassiveInput'
import Settings from './settings'
import {toast} from './toast'

export default function SetForm({
  onSaved,
  set,
  settings,
}: {
  set: GymSet
  onSaved: (set: GymSet) => void
  settings: Settings
}) {
  const [name, setName] = useState(set.name)
  const [reps, setReps] = useState(set.reps?.toString())
  const [weight, setWeight] = useState(set.weight?.toString())
  const [newImage, setNewImage] = useState(set.image)
  const [unit, setUnit] = useState(set.unit)
  const [showRemove, setShowRemove] = useState(false)
  const [selection, setSelection] = useState({
    start: 0,
    end: set.reps?.toString().length,
  })
  const [removeImage, setRemoveImage] = useState(false)
  const weightRef = useRef<TextInput>(null)
  const repsRef = useRef<TextInput>(null)
  const unitRef = useRef<TextInput>(null)

  const handleSubmit = async () => {
    console.log(`${SetForm.name}.handleSubmit:`, {set, uri: newImage, name})
    if (!name) return
    let image = newImage
    if (!newImage && !removeImage)
      image = await setRepo.findOne({where: {name}}).then(s => s?.image)

    console.log(`${SetForm.name}.handleSubmit:`, {image})
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
    onSaved(saved)
  }

  const handleName = useCallback((value: string) => {
    setName(value.replace(/,|'/g, ''))
    if (value.match(/,|'/))
      toast('Commas and single quotes would break CSV exports')
  }, [])

  const handleUnit = useCallback((value: string) => {
    setUnit(value.replace(/,|'/g, ''))
    if (value.match(/,|'/))
      toast('Commas and single quotes would break CSV exports')
  }, [])

  const changeImage = useCallback(async () => {
    const {fileCopyUri} = await DocumentPicker.pickSingle({
      type: 'image/*',
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
      <View style={{flex: 1}}>
        <MassiveInput
          label="Name"
          value={name}
          onChangeText={handleName}
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
            onChangeText={handleUnit}
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
