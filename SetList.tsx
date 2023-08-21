import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList } from "react-native";
import { List } from "react-native-paper";
import { Like } from "typeorm";
import { LIMIT } from "./constants";
import { getNow, setRepo, settingsRepo } from "./db";
import DrawerHeader from "./DrawerHeader";
import GymSet, { defaultSet } from "./gym-set";
import { HomePageParams } from "./home-page-params";
import ListMenu from "./ListMenu";
import Page from "./Page";
import SetItem from "./SetItem";
import Settings from "./settings";

export default function SetList() {
  const [refreshing, setRefreshing] = useState(false);
  const [sets, setSets] = useState<GymSet[]>([]);
  const [offset, setOffset] = useState(0);
  const [end, setEnd] = useState(false);
  const [settings, setSettings] = useState<Settings>();
  const [ids, setIds] = useState<number[]>([]);
  const navigation = useNavigation<NavigationProp<HomePageParams>>();
  const { params } = useRoute<RouteProp<HomePageParams, "Sets">>();
  const [term, setTerm] = useState(params?.search || "");

  const refresh = async ({
    value,
    take,
    skip,
  }: {
    value: string;
    take: number;
    skip: number;
  }) => {
    setRefreshing(true);
    const newSets = await setRepo
      .find({
        where: { name: Like(`%${value.trim()}%`), hidden: 0 as any },
        take,
        skip,
        order: { created: "DESC" },
      })
      .finally(() => setRefreshing(false));
    console.log(`${SetList.name}.refresh:`, { value, take, offset });
    setSets(newSets);
    setEnd(false);
  };

  useEffect(() => {
    settingsRepo.findOne({ where: {} }).then(setSettings);
    refresh({
      take: LIMIT,
      value: "",
      skip: 0,
    });
    /* eslint-disable react-hooks/exhaustive-deps */
  }, []);

  const search = (value: string) => {
    setTerm(value);
    setOffset(0);
    refresh({
      skip: 0,
      take: LIMIT,
      value,
    });
  };

  useEffect(() => {
    if (!params) return;
    console.log({ params });
    if (params.search) search(params.search);
    else if (params.refresh)
      refresh({
        skip: 0,
        take: offset,
        value: term,
      });
    else if (params.reset)
      refresh({
        skip: 0,
        take: LIMIT,
        value: term,
      });
    /* eslint-disable react-hooks/exhaustive-deps */
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
    if (end || refreshing) return;
    const newOffset = offset + LIMIT;
    console.log(`${SetList.name}.next:`, { offset, newOffset, term });
    setRefreshing(true);
    const newSets = await setRepo
      .find({
        where: { name: Like(`%${term}%`), hidden: 0 as any },
        take: LIMIT,
        skip: newOffset,
        order: { created: "DESC" },
      })
      .finally(() => setRefreshing(false));
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
    let set = sets[0];
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
    return refresh({
      skip: 0,
      take: LIMIT,
      value: term,
    });
  };

  const select = useCallback(() => {
    setIds(sets.map((set) => set.id));
  }, [sets]);

  const content = useMemo(() => {
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
        data={sets}
        style={{ flex: 1 }}
        renderItem={renderItem}
        onEndReached={next}
        refreshing={false}
        onRefresh={() =>
          refresh({
            skip: 0,
            take: LIMIT,
            value: term,
          })
        }
      />
    );
  }, [sets, settings, term]);

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
        {content}
      </Page>
    </>
  );
}
