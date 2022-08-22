import {ToastAndroid} from 'react-native';
import RNFS from 'react-native-fs';

export const write = async (name: string, data: string) => {
  const filePath = `${RNFS.DownloadDirectoryPath}/${name}`;
  await RNFS.writeFile(filePath, data);
  ToastAndroid.show(`Saved "${name}". Check downloads`, ToastAndroid.LONG);
};
