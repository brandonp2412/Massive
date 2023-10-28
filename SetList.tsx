import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { FlatList } from "react-native";
import { List } from "react-native-paper";
import { Like } from "typeorm";
import { LIMIT } from "./constants";
import { getNow, setRepo, settingsRepo } from "./db";
import DrawerHeader from "./DrawerHeader";
import { emitter } from "./emitter";
import GymSet, {
  defaultSet,
  GYM_SET_CREATED,
  GYM_SET_DELETED,
  GYM_SET_UPDATED,
} from "./gym-set";
import ListMenu from "./ListMenu";
import Page from "./Page";
import SetItem from "./SetItem";
import Settings, { SETTINGS } from "./settings";
import { StackParams } from "./AppStack";
import { DrawerParams } from "./drawer-param-list";

export default function SetList() {
  const [refreshing, setRefreshing] = useState(false);
  const [sets, setSets] = useState<GymSet[]>();
  const [offset, setOffset] = useState(0);
  const [end, setEnd] = useState(false);
  const [settings, setSettings] = useState<Settings>();
  const [ids, setIds] = useState<number[]>([]);
  const navigation = useNavigation<NavigationProp<StackParams>>();
  const { params } = useRoute<RouteProp<DrawerParams, "Home">>();
  const [term, setTerm] = useState(params?.search || "");

  const reset = useCallback(
    async (value: string) => {
      const newSets = await setRepo.find({
        where: { name: Like(`%${value.trim()}%`), hidden: 0 as any },
        take: LIMIT,
        skip: 0,
        order: { created: "DESC" },
      });
      console.log(`${SetList.name}.reset:`, { value, offset });
      setSets(newSets);
      setEnd(false);
    },
    [offset]
  );

  useEffect(() => {
    settingsRepo.findOne({ where: {} }).then(setSettings);
    reset("");
    /* eslint-disable react-hooks/exhaustive-deps */
  }, []);

  useEffect(() => {
    const updated = (gymSet: GymSet) => {
      if (!sets) console.log({ sets });
      console.log(`${SetList.name}.updated:`, { gymSet, length: sets.length });
      const newSets = sets.map((set) => {
        if (set.id !== gymSet.id) return set;
        if (gymSet.created === undefined) gymSet.created = set.created;
        return gymSet;
      });
      setSets(newSets);
    };

    const descriptions = [
      emitter.addListener(SETTINGS, () => {
        settingsRepo.findOne({ where: {} }).then(setSettings);
      }),
      emitter.addListener(GYM_SET_UPDATED, updated),
      emitter.addListener(GYM_SET_CREATED, () => reset("")),
      emitter.addListener(GYM_SET_DELETED, () => reset("")),
    ];
    return () => descriptions.forEach((description) => description.remove());
  }, [sets]);

  const search = (value: string) => {
    console.log(`${SetList.name}.search:`, value);
    setTerm(value);
    setOffset(0);
    reset(value);
  };

  useEffect(() => {
    console.log(`${SetList.name}.useEffect:`, params);
    if (params?.search) search(params.search);
  }, [params]);

  const renderItem = useCallback(
    ({ item }: { item: GymSet }) => (
      <SetItem
        settings={settings}
        item={item}
        key={item.id}
        ids={ids}
        setIds={setIds}
      />
    ),
    [settings, ids]
  );

  const next = async () => {
    console.log({ end, refreshing });
    if (end || refreshing) return;
    const newOffset = offset + LIMIT;
    console.log(`${SetList.name}.next:`, { offset, newOffset, term });
    const newSets = await setRepo.find({
      where: { name: Like(`%${term}%`), hidden: 0 as any },
      take: LIMIT,
      skip: newOffset,
      order: { created: "DESC" },
    });
    if (newSets.length === 0) return setEnd(true);
    if (!sets) return;
    const map = new Map<number, GymSet>();
    for (const set of sets) map.set(set.id, set);
    for (const set of newSets) map.set(set.id, set);
    const unique = Array.from(map.values());
    setSets(unique);
    if (newSets.length < LIMIT) return setEnd(true);
    setOffset(newOffset);
  };

  const onAdd = useCallback(async () => {
    const now = await getNow();
    let set = sets?.[0];
    if (!set) set = { ...defaultSet };
    set.created = now;
    delete set.id;
    navigation.navigate("EditSet", { set });
  }, [navigation, sets]);

  const edit = useCallback(() => {
    navigation.navigate("EditSets", { ids });
    setIds([]);
  }, [ids, navigation]);

  const copy = useCallback(async () => {
    const set = await setRepo.findOne({
      where: { id: ids.pop() },
    });
    delete set.id;
    delete set.created;
    navigation.navigate("EditSet", { set });
    setIds([]);
  }, [ids, navigation]);

  const clear = useCallback(() => {
    setIds([]);
  }, []);

  const remove = async () => {
    setIds([]);
    await setRepo.delete(ids.length > 0 ? ids : {});
    return reset(term);
  };

  const select = useCallback(() => {
    if (!sets) return;
    if (ids.length === sets.length) return setIds([]);
    setIds(sets.map((set) => set.id));
  }, [sets, ids]);

  const getContent = () => {
    if (!settings) return null;
    if (sets?.length === 0)
      return (
        <List.Item
          title="No sets yet"
          description="A set is a group of repetitions. E.g. 8 reps of Squats."
        />
      );
    return (
      <FlatList
        data={sets ?? []}
        style={{ flex: 1 }}
        renderItem={renderItem}
        onEndReached={next}
        refreshing={refreshing}
        keyExtractor={(set) => set.id?.toString()}
        onRefresh={() => {
          setOffset(0);
          setRefreshing(true);
          reset(term).finally(() => setRefreshing(false));
        }}
      />
    );
  };

  return (
    <>
      <DrawerHeader name={ids.length > 0 ? `${ids.length} selected` : "Home"}>
        <ListMenu
          onClear={clear}
          onCopy={copy}
          onDelete={remove}
          onEdit={edit}
          ids={ids}
          onSelect={select}
        />
      </DrawerHeader>

      <Page onAdd={onAdd} term={term} search={search}>
        {getContent()}
      </Page>
    </>
  );
}
