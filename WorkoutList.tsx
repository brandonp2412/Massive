import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { List } from "react-native-paper";
import { In } from "typeorm";
import { LIMIT } from "./constants";
import { setRepo, settingsRepo } from "./db";
import DrawerHeader from "./DrawerHeader";
import GymSet from "./gym-set";
import ListMenu from "./ListMenu";
import Page from "./Page";
import SetList from "./SetList";
import Settings from "./settings";
import WorkoutItem from "./WorkoutItem";
import { WorkoutsPageParams } from "./WorkoutsPage";

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<GymSet[]>();
  const [offset, setOffset] = useState(0);
  const [term, setTerm] = useState("");
  const [end, setEnd] = useState(false);
  const [settings, setSettings] = useState<Settings>();
  const [names, setNames] = useState<string[]>([]);
  const navigation = useNavigation<NavigationProp<WorkoutsPageParams>>();
  const { params } = useRoute<RouteProp<WorkoutsPageParams, "WorkoutList">>();

  const refresh = useCallback(async (value: string) => {
    const newWorkouts = await setRepo
      .createQueryBuilder()
      .select()
      .where("name LIKE :name", { name: `%${value.trim()}%` })
      .groupBy("name")
      .orderBy("name")
      .limit(LIMIT)
      .getMany();
    console.log(`${WorkoutList.name}`, { newWorkout: newWorkouts[0] });
    setWorkouts(newWorkouts);
    setOffset(0);
    setEnd(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh(term);
      settingsRepo.findOne({ where: {} }).then(setSettings);
      if (params?.clearNames) setNames([]);
    }, [refresh, term, params])
  );

  const renderItem = useCallback(
    ({ item }: { item: GymSet }) => (
      <WorkoutItem
        images={settings?.images}
        alarm={settings?.alarm}
        item={item}
        key={item.name}
        names={names}
        setNames={setNames}
      />
    ),
    [settings?.images, names, settings?.alarm]
  );

  const next = async () => {
    if (end) return;
    const newOffset = offset + LIMIT;
    console.log(`${SetList.name}.next:`, {
      offset,
      limit: LIMIT,
      newOffset,
      term,
    });
    const newWorkouts = await setRepo
      .createQueryBuilder()
      .select()
      .where("name LIKE :name", { name: `%${term.trim()}%` })
      .groupBy("name")
      .orderBy("name")
      .limit(LIMIT)
      .offset(newOffset)
      .getMany();
    if (newWorkouts.length === 0) return setEnd(true);
    if (!workouts) return;
    setWorkouts([...workouts, ...newWorkouts]);
    if (newWorkouts.length < LIMIT) return setEnd(true);
    setOffset(newOffset);
  };

  const onAdd = useCallback(async () => {
    navigation.navigate("EditWorkout", {
      gymSet: new GymSet(),
    });
  }, [navigation]);

  const search = useCallback(
    (value: string) => {
      setTerm(value);
      refresh(value);
    },
    [refresh]
  );

  const clear = useCallback(() => {
    setNames([]);
  }, []);

  const remove = async () => {
    setNames([]);
    if (names.length > 0) await setRepo.delete({ name: In(names) });
    await refresh(term);
  };

  const select = () => {
    if (!workouts) return;
    if (names.length === workouts.length) return setNames([]);
    setNames(workouts.map((workout) => workout.name));
  };

  const edit = () => {
    navigation.navigate("EditWorkouts", { names });
  };

  return (
    <>
      <DrawerHeader
        name={names.length > 0 ? `${names.length} selected` : "Workouts"}
      >
        <ListMenu
          onClear={clear}
          onDelete={remove}
          onEdit={edit}
          ids={names}
          onSelect={select}
        />
      </DrawerHeader>
      <Page onAdd={onAdd} term={term} search={search}>
        {workouts?.length === 0 ? (
          <List.Item
            title="No workouts yet."
            description="A workout is something you do at the gym. E.g. Deadlifts"
          />
        ) : (
          <FlatList
            data={workouts}
            style={{ flex: 1 }}
            renderItem={renderItem}
            keyExtractor={(w) => w.name}
            onEndReached={next}
          />
        )}
      </Page>
    </>
  );
}
