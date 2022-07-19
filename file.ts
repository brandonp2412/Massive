import {PermissionsAndroid, ToastAndroid} from 'react-native';
import {Dirs, FileSystem} from 'react-native-file-access';

export const write = async (name: string, data: string) => {
  const filePath = `${Dirs.DocumentDir}/${name}`;
  const permission = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };
  const granted = await permission();
  if (!granted) return;
  await FileSystem.writeFile(filePath, data);
  if (!FileSystem.exists(filePath)) return;
  await FileSystem.cpExternal(filePath, name, 'downloads');
  ToastAndroid.show(`Saved "${name}". Check downloads`, ToastAndroid.LONG);
};
