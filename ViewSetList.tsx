import { RouteProp, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { FlatList } from "react-native";
import { List } from "react-native-paper";
import { Like } from "typeorm";
import { StackParams } from "./AppStack";
import SetItem from "./SetItem";
import StackHeader from "./StackHeader";
import { LIMIT } from "./constants";
import { setRepo, settingsRepo } from "./db";
import GymSet from "./gym-set";
import Settings from "./settings";

export default function ViewSetList() {
  const [sets, setSets] = useState<GymSet[]>();
  const [settings, setSettings] = useState<Settings>();
  const { params } = useRoute<RouteProp<StackParams, "ViewSetList">>();

  useEffect(() => {
    settingsRepo.findOne({ where: {} }).then(setSettings);

    const reset = async () => {
      const newSets = await setRepo.find({
        where: { name: Like(`%${params.name}%`), hidden: 0 as any },
        take: LIMIT * 2,
        skip: 0,
        order: { created: "DESC" },
      });
      setSets(newSets);
    };

    reset();
  }, [params.name]);

  const renderItem = useCallback(
    ({ item }: { item: GymSet }) => (
      <SetItem
        settings={settings}
        item={item}
        key={item.id}
        ids={[]}
        setIds={() => null}
        disablePress
      />
    ),
    [settings]
  );

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
        keyExtractor={(set) => set.id?.toString()}
      />
    );
  };

  return (
    <>
      <StackHeader title={params.name} />

      {getContent()}
    </>
  );
}
