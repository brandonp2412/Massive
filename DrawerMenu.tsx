import {NavigationProp, useNavigation} from '@react-navigation/native'
import {useCallback, useState} from 'react'
import DocumentPicker from 'react-native-document-picker'
import {FileSystem} from 'react-native-file-access'
import {Divider, IconButton, Menu} from 'react-native-paper'
import ConfirmDialog from './ConfirmDialog'
import {AppDataSource} from './data-source'
import {planRepo} from './db'
import {DrawerParamList} from './drawer-param-list'
import GymSet from './gym-set'
import {useSnackbar} from './MassiveSnack'
import {Plan} from './plan'
import useDark from './use-dark'
import {write} from './write'

const setFields = 'id,name,reps,weight,created,unit,hidden,sets,minutes,seconds'
const planFields = 'id,days,workouts'
const setRepo = AppDataSource.manager.getRepository(GymSet)

export default function DrawerMenu({name}: {name: keyof DrawerParamList}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showRemove, setShowRemove] = useState(false)
  const {toast} = useSnackbar()
  const {reset} = useNavigation<NavigationProp<DrawerParamList>>()
  const dark = useDark()

  const exportSets = useCallback(async () => {
    const sets = await setRepo.find({})
    const data = [setFields]
      .concat(
        sets.map(set =>
          setFields
            .split(',')
            .map(fieldString => {
              const field = fieldString as keyof GymSet
              if (field === 'unit') return set[field] || 'kg'
              return set[field]
            })
            .join(','),
        ),
      )
      .join('\n')
    console.log(`${DrawerMenu.name}.exportSets`, {length: sets.length})
    await write('sets.csv', data)
  }, [])

  const exportPlans = useCallback(async () => {
    const plans = await planRepo.find({})
    const data = [planFields]
      .concat(plans.map(set => `"${set.id}","${set.days}","${set.workouts}"`))
      .join('\n')
    console.log(`${DrawerMenu.name}.exportPlans`, {length: plans.length})
    await write('plans.csv', data)
  }, [])

  const download = useCallback(async () => {
    setShowMenu(false)
    if (name === 'Home') exportSets()
    else if (name === 'Plans') exportPlans()
  }, [name, exportSets, exportPlans])

  const uploadSets = useCallback(async () => {
    const result = await DocumentPicker.pickSingle()
    const file = await FileSystem.readFile(result.uri)
    console.log(`${DrawerMenu.name}.uploadSets:`, file.length)
    const lines = file.split('\n')
    console.log(lines[0])
    if (!setFields.includes(lines[0])) return toast('Invalid csv.', 3000)
    const values = lines
      .slice(1)
      .filter(line => line)
      .map(line => {
        let [
          ,
          setName,
          reps,
          weight,
          created,
          unit,
          hidden,
          sets,
          minutes,
          seconds,
        ] = line.split(',')
        const set: GymSet = {
          name: setName,
          reps: +reps,
          weight: +weight,
          created,
          unit: unit ?? 'kg',
          hidden: !!Number(hidden),
          sets: +sets,
          minutes: +minutes,
          seconds: +seconds,
        }
        return set
      })
    console.log(`${DrawerMenu.name}.uploadSets:`, {values})
    await setRepo.insert(values)
    toast('Data imported.', 3000)
    reset({index: 0, routes: [{name}]})
  }, [reset, name, toast])

  const uploadPlans = useCallback(async () => {
    const result = await DocumentPicker.pickSingle()
    const file = await FileSystem.readFile(result.uri)
    console.log(`${DrawerMenu.name}.uploadPlans:`, file.length)
    const lines = file.split('\n')
    if (lines[0] != planFields) return toast('Invalid csv.', 3000)
    const values = file
      .split('\n')
      .slice(1)
      .filter(line => line)
      .map(set => {
        const [, days, workouts] = set
          .split('","')
          .map(cell => cell.replace(/"/g, ''))
        const plan: Plan = {
          days,
          workouts,
        }
        return plan
      })
    await planRepo.insert(values)
    toast('Data imported.', 3000)
  }, [toast])

  const upload = useCallback(async () => {
    setShowMenu(false)
    if (name === 'Home') await uploadSets()
    else if (name === 'Plans') await uploadPlans()
    reset({index: 0, routes: [{name}]})
  }, [name, uploadPlans, uploadSets, reset])

  const remove = useCallback(async () => {
    setShowMenu(false)
    setShowRemove(false)
    if (name === 'Home') await setRepo.delete({})
    else if (name === 'Plans') await planRepo.delete({})
    toast('All data has been deleted.', 4000)
    reset({index: 0, routes: [{name}]})
  }, [reset, name, toast])

  if (name === 'Home' || name === 'Plans')
    return (
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={
          <IconButton
            color={dark ? 'white' : 'white'}
            onPress={() => setShowMenu(true)}
            icon="more-vert"
          />
        }>
        <Menu.Item icon="arrow-downward" onPress={download} title="Download" />
        <Menu.Item icon="arrow-upward" onPress={upload} title="Upload" />
        <Divider />
        <Menu.Item
          icon="delete"
          onPress={() => setShowRemove(true)}
          title="Delete"
        />
        <ConfirmDialog
          title="Delete all data"
          show={showRemove}
          setShow={setShowRemove}
          onOk={remove}>
          This irreversibly deletes all data from the app. Are you sure?
        </ConfirmDialog>
      </Menu>
    )

  return null
}
