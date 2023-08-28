import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, Image } from "react-native";
import { List } from "react-native-paper";
import { getBestSets } from "./best.service";
import { LIMIT } from "./constants";
import { settingsRepo } from "./db";
import DrawerHeader from "./DrawerHeader";
import { GraphsPageParams } from "./GraphsPage";
import GymSet from "./gym-set";
import Page from "./Page";
import Settings from "./settings";

export default function GraphsList() {
  const [bests, setBests] = useState<GymSet[]>([]);
  const [offset, setOffset] = useState(0);
  const [end, setEnd] = useState(false);
  const [term, setTerm] = useState("");
  const navigation = useNavigation<NavigationProp<GraphsPageParams>>();
  const [settings, setSettings] = useState<Settings>();

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({ where: {} }).then(setSettings);
    }, [])
  );

  const refresh = useCallback(async (value: string) => {
    const result = await getBestSets({ term: value, offset: 0 });
    setBests(result);
    setOffset(0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh(term);
    }, [refresh, term])
  );

  const next = useCallback(async () => {
    if (end) return;
    const newOffset = offset + LIMIT;
    console.log(`${GraphsList.name}.next:`, { offset, newOffset, term });
    const newBests = await getBestSets({ term, offset });
    if (newBests.length === 0) return setEnd(true);
    if (!bests) return;
    setBests([...bests, ...newBests]);
    if (newBests.length < LIMIT) return setEnd(true);
    setOffset(newOffset);
  }, [term, end, offset, bests]);

  const search = useCallback(
    (value: string) => {
      setTerm(value);
      refresh(value);
    },
    [refresh]
  );

  const renderItem = ({ item }: { item: GymSet }) => (
    <List.Item
      key={item.name}
      title={item.name}
      description={`${item.reps} x ${item.weight}${item.unit || "kg"}`}
      onPress={() => navigation.navigate("ViewGraph", { best: item })}
      left={() =>
        (settings.images && item.image && (
          <Image
            source={{ uri: item.image }}
            style={{ height: 75, width: 75 }}
          />
        )) ||
        null
      }
    />
  );

  return (
    <>
      <DrawerHeader name="Graphs" />
      <Page term={term} search={search}>
        {bests?.length === 0 ? (
          <List.Item
            title="No exercises yet"
            description="Once sets have been added, this will highlight your personal bests."
          />
        ) : (
          <FlatList
            style={{ flex: 1 }}
            renderItem={renderItem}
            data={bests}
            onEndReached={next}
          />
        )}
      </Page>
    </>
  );
}
