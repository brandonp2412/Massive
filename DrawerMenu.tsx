import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext, useState} from 'react';
import DocumentPicker from 'react-native-document-picker';
import {FileSystem} from 'react-native-file-access';
import {Divider, IconButton, Menu} from 'react-native-paper';
import ConfirmDialog from './ConfirmDialog';
import {DrawerParamList} from './drawer-param-list';
import {SnackbarContext} from './MassiveSnack';
import {Plan} from './plan';
import {addPlans, deletePlans, getAllPlans} from './plan.service';
import {addSets, deleteSets, getAllSets} from './set.service';
import {write} from './write';

const setFields =
  'id,name,reps,weight,created,unit,hidden,sets,minutes,seconds';
const planFields = 'id,days,workouts';

export default function DrawerMenu({name}: {name: keyof DrawerParamList}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const {toast} = useContext(SnackbarContext);
  const {reset} = useNavigation<NavigationProp<DrawerParamList>>();

  const exportSets = useCallback(async () => {
    const sets = await getAllSets();
    const data = [setFields]
      .concat(
        sets.map(
          set =>
            `${set.id},${set.name},${set.reps},${set.weight},${set.created},${set.unit},${set.hidden},${set.sets},${set.minutes},${set.seconds}`,
        ),
      )
      .join('\n');
    console.log(`${DrawerMenu.name}.exportSets`, {length: sets.length});
    await write('sets.csv', data);
  }, []);

  const exportPlans = useCallback(async () => {
    const plans: Plan[] = await getAllPlans();
    const data = [planFields]
      .concat(plans.map(set => `"${set.id}","${set.days}","${set.workouts}"`))
      .join('\n');
    console.log(`${DrawerMenu.name}.exportPlans`, {length: plans.length});
    await write('plans.csv', data);
  }, []);

  const download = useCallback(async () => {
    setShowMenu(false);
    if (name === 'Home') exportSets();
    else if (name === 'Plans') exportPlans();
  }, [name, exportSets, exportPlans]);

  const uploadSets = useCallback(async () => {
    const result = await DocumentPicker.pickSingle();
    const file = await FileSystem.readFile(result.uri);
    console.log(`${DrawerMenu.name}.${uploadSets.name}:`, file.length);
    const lines = file.split('\n');
    console.log(lines[0]);
    if (!setFields.includes(lines[0])) return toast('Invalid csv.', 3000);
    const values = lines
      .slice(1)
      .filter(line => line)
      .map(set => {
        const [
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
        ] = set.split(',');
        return `('${setName}',${reps},${weight},'${created}','${unit}',${hidden},${
          sets ?? 3
        },${minutes ?? 3},${seconds ?? 30})`;
      })
      .join(',');
    await addSets(setFields.split(',').slice(1).join(','), values);
    toast('Data imported.', 3000);
    reset({index: 0, routes: [{name}]});
  }, [reset, name, toast]);

  const uploadPlans = useCallback(async () => {
    const result = await DocumentPicker.pickSingle();
    const file = await FileSystem.readFile(result.uri);
    console.log(`${DrawerMenu.name}.uploadPlans:`, file.length);
    const lines = file.split('\n');
    if (lines[0] != planFields) return toast('Invalid csv.', 3000);
    const values = file
      .split('\n')
      .slice(1)
      .filter(line => line)
      .map(set => {
        const [, days, workouts] = set
          .split('","')
          .map(cell => cell.replace(/"/g, ''));
        return `('${days}','${workouts}')`;
      })
      .join(',');
    await addPlans(values);
    toast('Data imported.', 3000);
  }, [toast]);

  const upload = useCallback(async () => {
    setShowMenu(false);
    if (name === 'Home') await uploadSets();
    else if (name === 'Plans') await uploadPlans();
    reset({index: 0, routes: [{name}]});
  }, [name, uploadPlans, uploadSets, reset]);

  const remove = useCallback(async () => {
    setShowMenu(false);
    setShowRemove(false);
    if (name === 'Home') await deleteSets();
    else if (name === 'Plans') await deletePlans();
    toast('All data has been deleted.', 4000);
    reset({index: 0, routes: [{name}]});
  }, [reset, name, toast]);

  if (name === 'Home' || name === 'Plans')
    return (
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={
          <IconButton onPress={() => setShowMenu(true)} icon="more-vert" />
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
    );

  return null;
}
