import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {List} from 'react-native-paper';
import {Like} from 'typeorm';
import {getNow, setRepo} from './db';
import DrawerHeader from './DrawerHeader';
import GymSet from './gym-set';
import {HomePageParams} from './home-page-params';
import Page from './Page';
import SetItem from './SetItem';

const limit = 15;

export default function SetList() {
  const [sets, setSets] = useState<GymSet[]>([]);
  const [set, setSet] = useState<GymSet>();
  const [offset, setOffset] = useState(0);
  const [term, setTerm] = useState('');
  const [end, setEnd] = useState(false);
  const navigation = useNavigation<NavigationProp<HomePageParams>>();

  useEffect(() => console.log({sets}), [sets]);

  const refresh = useCallback(async (value: string) => {
    const newSets = await setRepo.find({
      where: {name: Like(`%${value}%`), hidden: 0 as any},
      take: limit,
      skip: 0,
      order: {created: 'DESC'},
    });
    setSet(newSets[0]);
    if (newSets.length === 0) return setSets([]);
    setSets(newSets);
    setOffset(0);
    setEnd(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh(term);
    }, [refresh, term]),
  );

  const renderItem = useCallback(
    ({item}: {item: GymSet}) => (
      <SetItem item={item} key={item.id} onRemove={() => refresh(term)} />
    ),
    [refresh, term],
  );

  const next = useCallback(async () => {
    if (end) return;
    const newOffset = offset + limit;
    console.log(`${SetList.name}.next:`, {offset, newOffset, term});
    const newSets = await setRepo.find({
      where: {name: Like(`%${term}%`), hidden: 0 as any},
      take: limit,
      skip: newOffset,
      order: {created: 'DESC'},
    });
    if (newSets.length === 0) return setEnd(true);
    if (!sets) return;
    // setSets([...sets, ...newSets]);
    if (newSets.length < limit) return setEnd(true);
    setOffset(newOffset);
  }, [term, end, offset, sets]);

  const onAdd = useCallback(async () => {
    console.log(`${SetList.name}.onAdd`, {set});
    const [{now}] = await getNow();
    navigation.navigate('EditSet', {
      set: set || {
        hidden: false,
        minutes: 3,
        name: '',
        reps: 0,
        seconds: 30,
        sets: 3,
        weight: 0,
        created: now,
      },
    });
  }, [navigation, set]);

  const search = useCallback(
    (value: string) => {
      setTerm(value);
      refresh(value);
    },
    [refresh],
  );

  return (
    <>
      <DrawerHeader name="Home" />
      <Page onAdd={onAdd} term={term} search={search}>
        {sets?.length === 0 ? (
          <List.Item
            title="No sets yet"
            description="A set is a group of repetitions. E.g. 8 reps of Squats."
          />
        ) : (
          <FlatList
            data={sets}
            style={{flex: 1}}
            renderItem={renderItem}
            getItem={(data: any, index: number) => {
              console.log({data, index});
              return data[index];
            }}
            onEndReached={next}
          />
        )}
      </Page>
    </>
  );
}
