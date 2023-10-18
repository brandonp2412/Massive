import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { FlatList } from "react-native";
import { List } from "react-native-paper";
import { In } from "typeorm";
import { LIMIT } from "./constants";
import { setRepo, settingsRepo } from "./db";
import DrawerHeader from "./DrawerHeader";
import { emitter } from "./emitter";
import GymSet from "./gym-set";
import ListMenu from "./ListMenu";
import Page from "./Page";
import SetList from "./SetList";
import Settings, { SETTINGS } from "./settings";
import WorkoutItem from "./WorkoutItem";
import { WorkoutsPageParams } from "./WorkoutsPage";

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<GymSet[]>();
  const [offset, setOffset] = useState(0);
  const [term, setTerm] = useState("");
  const [end, setEnd] = useState(false);
  const [settings, setSettings] = useState<Settings>();
  const [names, setNames] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<WorkoutsPageParams>>();
  const { params } = useRoute<RouteProp<WorkoutsPageParams, "WorkoutList">>();

  const update = (newWorkout: GymSet) => {
    console.log(`${WorkoutList.name}.update:`, newWorkout);
    if (!workouts) return;
    const newWorkouts = workouts.map((workout) =>
      workout.name === newWorkout.name ? newWorkout : workout
    );
    setWorkouts(newWorkouts);
  };

  const reset = async (value: string) => {
    console.log(`${WorkoutList.name}.reset`, value);
    const newWorkouts = await setRepo
      .createQueryBuilder()
      .select()
      .where("name LIKE :name", { name: `%${value.trim()}%` })
      .groupBy("name")
      .orderBy("name")
      .limit(LIMIT)
      .getMany();
    setOffset(0);
    console.log(`${WorkoutList.name}.reset`, { length: newWorkouts.length });
    setEnd(newWorkouts.length < LIMIT);
    setWorkouts(newWorkouts);
  };

  useEffect(() => {
    settingsRepo.findOne({ where: {} }).then(setSettings);
    const description = emitter.addListener(SETTINGS, () => {
      settingsRepo.findOne({ where: {} }).then(setSettings);
    });
    return description.remove;
  }, []);

  useEffect(() => {
    console.log(`${WorkoutList.name}.useEffect`, params);
    if (!params) reset("");
    if (params?.search) search(params.search);
    else if (params?.update) update(params.update);
    else if (params?.reset) reset(term);
    else if (params?.clearNames) setNames([]);
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [params]);

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
    console.log(`${SetList.name}.next:`, {
      offset,
      limit: LIMIT,
      term,
      end,
    });
    if (end) return;
    const newOffset = offset + LIMIT;
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

  const search = (value: string) => {
    setTerm(value);
    reset(value);
  };

  const clear = useCallback(() => {
    setNames([]);
  }, []);

  const remove = async () => {
    setNames([]);
    if (names.length > 0) await setRepo.delete({ name: In(names) });
    await reset(term);
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
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              reset("").finally(() => setRefreshing(false));
            }}
          />
        )}
      </Page>
    </>
  );
}
