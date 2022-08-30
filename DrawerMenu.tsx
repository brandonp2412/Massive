import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext, useState} from 'react';
import DocumentPicker from 'react-native-document-picker';
import {FileSystem} from 'react-native-file-access';
import {Divider, IconButton, Menu} from 'react-native-paper';
import {DrawerParamList, SnackbarContext} from './App';
import ConfirmDialog from './ConfirmDialog';
import {Plan} from './plan';
import {DatabaseContext} from './Routes';
import Set from './set';
import {write} from './write';

const setFields = 'id,name,reps,weight,created,unit,hidden';
const planFields = 'id,days,workouts';

export default function DrawerMenu({name}: {name: keyof DrawerParamList}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const db = useContext(DatabaseContext);
  const {toast} = useContext(SnackbarContext);
  const {reset} = useNavigation<NavigationProp<DrawerParamList>>();

  const exportSets = useCallback(async () => {
    const [result] = await db.executeSql('SELECT * FROM sets');
    if (result.rows.length === 0) return;
    const sets: Set[] = result.rows.raw();
    const data = [setFields]
      .concat(
        sets.map(
          set =>
            `${set.id},${set.name},${set.reps},${set.weight},${set.created},${set.unit},${set.hidden}`,
        ),
      )
      .join('\n');
    console.log(`${DrawerMenu.name}.exportSets`, {length: sets.length});
    await write('sets.csv', data);
  }, [db]);

  const exportPlans = useCallback(async () => {
    const [result] = await db.executeSql('SELECT * FROM plans');
    if (result.rows.length === 0) return;
    const sets: Plan[] = result.rows.raw();
    const data = [planFields]
      .concat(sets.map(set => `"${set.id}","${set.days}","${set.workouts}"`))
      .join('\n');
    console.log(`${DrawerMenu.name}.exportPlans`, {length: sets.length});
    await write('plans.csv', data);
  }, [db]);

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
    if (lines[0] != setFields) return toast('Invalid csv.', 3000);
    const values = lines
      .slice(1)
      .filter(line => line)
      .map(set => {
        const cells = set.split(',');
        return `('${cells[1]}',${cells[2]},${cells[3]},'${cells[4]}','${cells[5]}',${cells[6]})`;
      })
      .join(',');
    await db.executeSql(
      `INSERT INTO sets(name,reps,weight,created,unit,hidden) VALUES ${values}`,
    );
    toast('Data imported.', 3000);
    reset({index: 0, routes: [{name}]});
  }, [db, reset, name, toast]);

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
        const cells = set.split('","').map(cell => cell.replace(/"/g, ''));
        return `('${cells[1]}','${cells[2]}')`;
      })
      .join(',');
    await db.executeSql(`INSERT INTO plans(days,workouts) VALUES ${values}`);
    toast('Data imported.', 3000);
  }, [db, toast]);

  const upload = useCallback(async () => {
    setShowMenu(false);
    if (name === 'Home') await uploadSets();
    else if (name === 'Plans') await uploadPlans();
    reset({index: 0, routes: [{name}]});
  }, [name, uploadPlans, uploadSets, reset]);

  const remove = useCallback(async () => {
    setShowMenu(false);
    setShowRemove(false);
    if (name === 'Home') await db.executeSql(`DELETE FROM sets`);
    else if (name === 'Plans') await db.executeSql(`DELETE FROM plans`);
    toast('All data has been deleted.', 4000);
    reset({index: 0, routes: [{name}]});
  }, [db, reset, name, toast]);

  if (name === 'Home' || name === 'Plans')
    return (
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={
          <IconButton
            onPress={() => setShowMenu(true)}
            icon="ellipsis-vertical"
          />
        }>
        <Menu.Item icon="arrow-down" onPress={download} title="Download" />
        <Menu.Item icon="arrow-up" onPress={upload} title="Upload" />
        <Divider />
        <Menu.Item
          icon="trash"
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
