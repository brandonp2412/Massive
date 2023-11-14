import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { IconButton, List } from "react-native-paper";
import { Like } from "typeorm";
import { StackParams } from "./AppStack";
import { LIMIT } from "./constants";
import { getNow, settingsRepo, weightRepo } from "./db";
import DrawerHeader from "./DrawerHeader";
import Page from "./Page";
import Settings from "./settings";
import { default as Weight, defaultWeight } from "./weight";
import WeightItem from "./WeightItem";

export default function WeightList() {
  const [refreshing, setRefreshing] = useState(false);
  const [weights, setWeights] = useState<Weight[]>();
  const [offset, setOffset] = useState(0);
  const [end, setEnd] = useState(false);
  const [settings, setSettings] = useState<Settings>();
  const { navigate } = useNavigation<NavigationProp<StackParams>>();
  const [term, setTerm] = useState("");

  const reset = useCallback(
    async (value: string) => {
      const newWeights = await weightRepo.find({
        where: [
          {
            value: isNaN(Number(term)) ? undefined : Number(term),
          },
          {
            created: Like(`%${term}%`),
          },
        ],
        take: LIMIT,
        skip: 0,
        order: { created: "DESC" },
      });
      console.log(`${WeightList.name}.reset:`, { value, offset });
      setWeights(newWeights);
      setEnd(false);
    },
    [offset, term]
  );

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({ where: {} }).then(setSettings);
      reset(term);
      // eslint-disable-next-line
    }, [term])
  );

  const search = (value: string) => {
    console.log(`${WeightList.name}.search:`, value);
    setTerm(value);
    setOffset(0);
    reset(value);
  };

  const renderItem = useCallback(
    ({ item }: { item: Weight }) => (
      <WeightItem settings={settings} item={item} key={item.id} />
    ),
    [settings]
  );

  const next = async () => {
    console.log({ end, refreshing });
    if (end || refreshing) return;
    const newOffset = offset + LIMIT;
    console.log(`${WeightList.name}.next:`, { offset, newOffset, term });
    const newWeights = await weightRepo.find({
      where: [
        {
          value: Number(term),
        },
        {
          created: Like(`%${term}%`),
        },
      ],
      take: LIMIT,
      skip: newOffset,
      order: { created: "DESC" },
    });
    if (newWeights.length === 0) return setEnd(true);
    if (!weights) return;
    const map = new Map<number, Weight>();
    for (const weight of weights) map.set(weight.id, weight);
    for (const weight of newWeights) map.set(weight.id, weight);
    const unique = Array.from(map.values());
    setWeights(unique);
    if (newWeights.length < LIMIT) return setEnd(true);
    setOffset(newOffset);
  };

  const onAdd = useCallback(async () => {
    const now = await getNow();
    let weight: Partial<Weight> = { ...weights[0] };
    if (!weight) weight = { ...defaultWeight };
    weight.created = now;
    delete weight.id;
    navigate("EditWeight", { weight });
  }, [navigate, weights]);

  const getContent = () => {
    if (!settings) return null;
    if (weights?.length === 0)
      return (
        <List.Item
          title="No sets yet"
          description="A set is a group of repetitions. E.g. 8 reps of Squats."
        />
      );
    return (
      <FlatList
        data={weights ?? []}
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
      <DrawerHeader name="Weight">
        <IconButton
          onPress={() => navigate("ViewWeightGraph")}
          icon="chart-bell-curve-cumulative"
        />
      </DrawerHeader>

      <Page onAdd={onAdd} term={term} search={search}>
        {getContent()}
      </Page>
    </>
  );
}
