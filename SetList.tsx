import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { List } from "react-native-paper";
import { Like } from "typeorm";
import { StackParams } from "./AppStack";
import DrawerHeader from "./DrawerHeader";
import ListMenu from "./ListMenu";
import Page from "./Page";
import SetItem from "./SetItem";
import { LIMIT } from "./constants";
import { getNow, setRepo, settingsRepo } from "./db";
import GymSet, { defaultSet } from "./gym-set";
import Settings from "./settings";

export default function SetList() {
  const [refreshing, setRefreshing] = useState(false);
  const [sets, setSets] = useState<GymSet[]>();
  const [offset, setOffset] = useState(0);
  const [end, setEnd] = useState(false);
  const [settings, setSettings] = useState<Settings>();
  const [ids, setIds] = useState<number[]>([]);
  const navigation = useNavigation<NavigationProp<StackParams>>();
  const [term, setTerm] = useState("");

  const reset = useCallback(
    async (value: string) => {
      const newSets = await setRepo.find({
        where: { name: Like(`%${value.trim()}%`), hidden: 0 as any },
        take: LIMIT,
        skip: 0,
        order: { created: "DESC" },
      });
      setSets(newSets);
      console.log(`${SetList.name}.reset:`, { value, offset });
      setEnd(false);
    },
    [offset]
  );

  useFocusEffect(
    useCallback(() => {
      console.log(`${SetList.name}.focus:`, { term });
      settingsRepo.findOne({ where: {} }).then(setSettings);
      reset(term);
      // eslint-disable-next-line
    }, [term])
  );

  const search = (value: string) => {
    console.log(`${SetList.name}.search:`, value);
    setTerm(value);
    setOffset(0);
    reset(value);
  };

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
    console.log(`${SetList.name}.next:`, { end, refreshing });
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
    let set: Partial<GymSet> = { ...sets[0] };
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
    if (!settings || sets === undefined) return null;
    if (sets.length === 0)
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
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        keyExtractor={(set) => set.id.toString()}
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
      <DrawerHeader
        name={ids.length > 0 ? `${ids.length} selected` : "History"}
      >
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
