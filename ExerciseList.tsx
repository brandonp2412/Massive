import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { List } from "react-native-paper";
import { In } from "typeorm";
import { StackParams } from "./AppStack";
import { LIMIT } from "./constants";
import { setRepo, settingsRepo } from "./db";
import DrawerHeader from "./DrawerHeader";
import ExerciseItem from "./ExerciseItem";
import GymSet from "./gym-set";
import ListMenu from "./ListMenu";
import Page from "./Page";
import SetList from "./SetList";
import Settings from "./settings";

export default function ExerciseList() {
  const [exercises, setExercises] = useState<GymSet[]>();
  const [offset, setOffset] = useState(0);
  const [term, setTerm] = useState("");
  const [end, setEnd] = useState(false);
  const [settings, setSettings] = useState<Settings>();
  const [names, setNames] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<StackParams>>();

  const reset = async (value: string) => {
    console.log(`${ExerciseList.name}.reset`, value);
    const newExercises = await setRepo
      .createQueryBuilder()
      .select()
      .where("name LIKE :name", { name: `%${value.trim()}%` })
      .groupBy("name")
      .orderBy("name")
      .limit(LIMIT)
      .getMany();
    setOffset(0);
    console.log(`${ExerciseList.name}.reset`, { length: newExercises.length });
    setEnd(newExercises.length < LIMIT);
    setExercises(newExercises);
  };

  useFocusEffect(
    useCallback(() => {
      reset(term);
      settingsRepo.findOne({ where: {} }).then(setSettings);
    }, [term])
  );

  const renderItem = useCallback(
    ({ item }: { item: GymSet }) => (
      <ExerciseItem
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
    const newExercises = await setRepo
      .createQueryBuilder()
      .select()
      .where("name LIKE :name", { name: `%${term.trim()}%` })
      .groupBy("name")
      .orderBy("name")
      .limit(LIMIT)
      .offset(newOffset)
      .getMany();
    if (newExercises.length === 0) return setEnd(true);
    if (!exercises) return;
    setExercises([...exercises, ...newExercises]);
    if (newExercises.length < LIMIT) return setEnd(true);
    setOffset(newOffset);
  };

  const onAdd = useCallback(async () => {
    navigation.navigate("EditExercise", {
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
    if (!exercises) return;
    if (names.length === exercises.length) return setNames([]);
    setNames(exercises.map((exercise) => exercise.name));
  };

  const edit = () => {
    navigation.navigate("EditExercises", { names });
  };

  return (
    <>
      <DrawerHeader
        name={names.length > 0 ? `${names.length} selected` : "Exercises"}
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
        {exercises?.length === 0 ? (
          <List.Item
            title="No exercises yet."
            description="An exercise is something you do at the gym. E.g. Deadlifts"
          />
        ) : (
          <FlatList
            data={exercises}
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
