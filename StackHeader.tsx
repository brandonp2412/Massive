import {useNavigation} from '@react-navigation/native';
import Share from 'react-native-share';
import {FileSystem} from 'react-native-file-access';
import {Appbar, IconButton} from 'react-native-paper';
import {captureScreen} from 'react-native-view-shot';

export default function StackHeader({title}: {title: string}) {
  const navigation = useNavigation();

  return (
    <Appbar.Header>
      <IconButton icon="arrow-back" onPress={navigation.goBack} />
      <Appbar.Content title={title} />
      <IconButton
        onPress={() =>
          captureScreen().then(async uri => {
            const base64 = await FileSystem.readFile(uri, 'base64');
            const url = `data:image/jpeg;base64,${base64}`;
            Share.open({
              type: 'image/jpeg',
              url,
            });
          })
        }
        icon="share"
      />
    </Appbar.Header>
  );
}
