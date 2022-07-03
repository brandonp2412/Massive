import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Text, View} from 'react-native';
import {RootStackParamList} from './App';
import React from 'react';

export default function Exercises({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Exercises'>) {
  return (
    <View>
      <Text>Pull ups - 1 rep</Text>
      <Button title="Go home" onPress={() => navigation.navigate('Home', {})} />
    </View>
  );
}
