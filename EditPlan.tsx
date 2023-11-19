import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { IconButton, Switch as PaperSwitch, Text } from "react-native-paper";
import AppInput from "./AppInput";
import { StackParams } from "./AppStack";
import PrimaryButton from "./PrimaryButton";
import StackHeader from "./StackHeader";
import Switch from "./Switch";
import { MARGIN, PADDING } from "./constants";
import { DAYS } from "./days";
import { planRepo, setRepo } from "./db";
import { DrawerParams } from "./drawer-params";
import GymSet, { defaultSet } from "./gym-set";

export default function EditPlan() {
  const { params } = useRoute<RouteProp<StackParams, "EditPlan">>();
  const { plan } = params;
  const [title, setTitle] = useState<string>(plan?.title);
  const [names, setNames] = useState<string[]>();

  const [days, setDays] = useState<string[]>(
    plan.days ? plan.days.split(",") : []
  );

  const [exercises, setExercises] = useState<string[]>(
    plan.exercises ? plan.exercises.split(",") : []
  );

  const { navigate: drawerNavigate } =
    useNavigation<NavigationProp<DrawerParams>>();
  const { navigate: stackNavigate } =
    useNavigation<NavigationProp<StackParams>>();

  useEffect(() => {
    setRepo
      .createQueryBuilder()
      .select("name")
      .distinct(true)
      .orderBy("name")
      .getRawMany()
      .then((values) => {
        const newNames = values.map((value) => value.name);
        console.log(EditPlan.name, { newNames });
        setNames(newNames);
      });
  }, []);

  const save = useCallback(async () => {
    console.log(`${EditPlan.name}.save`, { days, exercises, plan });
    if (!days || !exercises) return;
    const newExercises = exercises.filter((exercise) => exercise).join(",");
    const newDays = days.filter((day) => day).join(",");
    await planRepo.save({
      title: title,
      days: newDays,
      exercises: newExercises,
      id: plan.id,
    });
  }, [title, days, exercises, plan]);

  const toggleExercise = useCallback(
    (on: boolean, name: string) => {
      if (on) {
        setExercises([...exercises, name]);
      } else {
        setExercises(exercises.filter((exercise) => exercise !== name));
      }
    },
    [setExercises, exercises]
  );

  const toggleDay = useCallback(
    (on: boolean, day: string) => {
      if (on) {
        setDays([...days, day]);
      } else {
        setDays(days.filter((d) => d !== day));
      }
    },
    [setDays, days]
  );

  const renderDay = (day: string) => (
    <Switch
      key={day}
      onChange={(value) => toggleDay(value, day)}
      value={days.includes(day)}
      title={day}
    />
  );

  const renderExercise = (name: string, index: number) => (
    <Pressable
      onPress={() => toggleExercise(!exercises.includes(name), name)}
      style={{ flexDirection: "row", alignItems: "center" }}
    >
      <PaperSwitch
        value={exercises.includes(name)}
        style={{ marginRight: MARGIN }}
        onValueChange={(value) => toggleExercise(value, name)}
      />
      <Text>{name}</Text>
      <IconButton
        icon="arrow-up"
        style={{ marginLeft: "auto" }}
        onPressIn={() => moveUp(index)}
      />
      <IconButton icon="arrow-down" onPressIn={() => moveDown(index)} />
    </Pressable>
  );

  const moveDown = (from: number) => {
    if (from === names.length - 1) return;
    const to = from + 1;
    const newNames = [...names];
    const copy = newNames[from];
    newNames[from] = newNames[to];
    newNames[to] = copy;
    const newExercises = newNames.filter((name) => exercises.includes(name));
    setExercises(newExercises);
    setNames(newNames);
  };

  const moveUp = (from: number) => {
    if (from === 0) return;
    const to = from - 1;
    const newNames = [...names];
    const copy = newNames[from];
    newNames[from] = newNames[to];
    newNames[to] = copy;
    const newExercises = newNames.filter((name) => exercises.includes(name));
    setExercises(newExercises);
    setNames(newNames);
  };

  return (
    <>
      <StackHeader
        title={typeof plan.id === "number" ? "Edit plan" : "Add plan"}
      >
        {typeof plan.id === "number" && (
          <IconButton
            onPress={async () => {
              await save();
              const newPlan = await planRepo.findOne({
                where: { id: plan.id },
              });
              let first: Partial<GymSet> = await setRepo.findOne({
                where: { name: exercises[0] },
                order: { created: "desc" },
              });
              if (!first) first = { ...defaultSet, name: exercises[0] };
              delete first.id;
              stackNavigate("StartPlan", { plan: newPlan, first });
            }}
            icon="play"
          />
        )}
      </StackHeader>
      <View style={{ padding: PADDING, flex: 1 }}>
        <AppInput
          label="Title"
          value={title}
          onChangeText={(value) => setTitle(value)}
        />

        <Text style={styles.title}>Days</Text>
        {DAYS.map((day) => renderDay(day))}

        <Text style={[styles.title, { marginTop: MARGIN }]}>Exercises</Text>
        {names !== undefined && (
          <FlatList
            data={names}
            ListEmptyComponent={<Text>No exercises yet</Text>}
            renderItem={({ item, index }) => renderExercise(item, index)}
            keyExtractor={(item) => item}
            style={{
              flex: 1,
            }}
          />
        )}
      </View>

      <PrimaryButton
        disabled={exercises.length === 0 && days.length === 0}
        icon="content-save"
        onPress={async () => {
          await save();
          drawerNavigate("Plans");
        }}
        style={{ margin: MARGIN }}
      >
        Save
      </PrimaryButton>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    marginBottom: MARGIN,
  },
});
