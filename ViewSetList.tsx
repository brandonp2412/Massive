import { RouteProp, useRoute } from "@react-navigation/native";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { List, Text, useTheme } from "react-native-paper";
import { Like } from "typeorm";
import { StackParams } from "./AppStack";
import StackHeader from "./StackHeader";
import { LIMIT } from "./constants";
import { setRepo, settingsRepo } from "./db";
import GymSet from "./gym-set";
import Settings from "./settings";

interface ColorSet extends GymSet {
  color?: string;
}

export default function ViewSetList() {
  const [sets, setSets] = useState<ColorSet[]>();
  const [settings, setSettings] = useState<Settings>();
  const { colors } = useTheme();
  const { params } = useRoute<RouteProp<StackParams, "ViewSetList">>();

  useEffect(() => {
    settingsRepo.findOne({ where: {} }).then(setSettings);

    const reset = async () => {
      const newSets: ColorSet[] = await setRepo.find({
        where: { name: Like(`%${params.name}%`), hidden: 0 as any },
        take: LIMIT,
        skip: 0,
        order: { created: "DESC" },
      });

      let prevDate = null;
      const elevate = colors.elevation.level2;
      const transparent = colors.elevation.level0;
      let color = elevate;

      for (let i = 0; i < newSets.length; i++) {
        let currDate = new Date(newSets[i].created).toDateString();
        if (currDate !== prevDate)
          color = color === elevate ? transparent : elevate;
        newSets[i].color = color;
        prevDate = currDate;
      }

      setSets(newSets);
    };

    reset();
  }, [params.name, colors]);

  const renderItem = ({ item }: { item: ColorSet; index: number }) => (
    <List.Item
      title={format(new Date(item.created), settings.date || "Pp")}
      style={{ backgroundColor: item.color }}
      right={() => (
        <Text
          style={{
            alignSelf: "center",
          }}
        >
          {`${item.reps} x ${item.weight}${item.unit || "kg"}`}
        </Text>
      )}
    />
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
