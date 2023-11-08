import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  Button,
  IconButton,
  Switch as PaperSwitch,
  Text,
} from "react-native-paper";
import ReorderableList, {
  ReorderableListRenderItemInfo,
} from "react-native-reorderable-list";
import AppInput from "./AppInput";
import { StackParams } from "./AppStack";
import StackHeader from "./StackHeader";
import Switch from "./Switch";
import { MARGIN, PADDING } from "./constants";
import { DAYS } from "./days";
import { planRepo, setRepo } from "./db";
import { DrawerParams } from "./drawer-param-list";
import { defaultSet } from "./gym-set";

export default function EditPlan() {
  const { params } = useRoute<RouteProp<StackParams, "EditPlan">>();
  const { plan } = params;
  const [title, setTitle] = useState<string>(plan?.title);
  const [days, setDays] = useState<string[]>(
    plan.days ? plan.days.split(",") : []
  );
  const [workouts, setWorkouts] = useState<string[]>(
    plan.workouts ? plan.workouts.split(",") : []
  );
  const [names, setNames] = useState<string[]>([]);
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
    console.log(`${EditPlan.name}.save`, { days, workouts, plan });
    if (!days || !workouts) return;
    const newWorkouts = workouts.filter((workout) => workout).join(",");
    const newDays = days.filter((day) => day).join(",");
    await planRepo.save({
      title: title,
      days: newDays,
      workouts: newWorkouts,
      id: plan.id,
    });
  }, [title, days, workouts, plan]);

  const toggleWorkout = useCallback(
    (on: boolean, name: string) => {
      if (on) {
        setWorkouts([...workouts, name]);
      } else {
        setWorkouts(workouts.filter((workout) => workout !== name));
      }
    },
    [setWorkouts, workouts]
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

  const renderWorkout = ({
    item,
    drag,
  }: ReorderableListRenderItemInfo<string>) => (
    <Pressable
      onLongPress={drag}
      onPress={() => toggleWorkout(!workouts.includes(item), item)}
      style={{ flexDirection: "row", alignItems: "center" }}
    >
      <PaperSwitch
        value={workouts.includes(item)}
        style={{ marginRight: MARGIN }}
        onValueChange={(value) => toggleWorkout(value, item)}
      />
      <Text>{item}</Text>
    </Pressable>
  );

  const reorderWorkout = (from: number, to: number) => {
    const newNames = [...names];
    const copy = newNames[from];
    newNames[from] = newNames[to];
    newNames[to] = copy;
    const newWorkouts = newNames.filter((name) => workouts.includes(name));
    console.log({ newWorkouts });
    setWorkouts(newWorkouts);
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
              let first = await setRepo.findOne({
                where: { name: workouts[0] },
                order: { created: "desc" },
              });
              if (!first) first = { ...defaultSet, name: workouts[0] };
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

        <Text style={[styles.title, { marginTop: MARGIN }]}>Workouts</Text>
        {names.length === 0 ? (
          <View>
            <Text>No workouts found.</Text>
          </View>
        ) : (
          <ReorderableList
            data={names}
            onReorder={({ fromIndex, toIndex }) =>
              reorderWorkout(fromIndex, toIndex)
            }
            renderItem={renderWorkout}
            keyExtractor={(item) => item}
            dragScale={1.025}
            style={{
              flex: 1,
            }}
            containerStyle={{ flex: 1 }}
          />
        )}

        <Button
          disabled={workouts.length === 0 && days.length === 0}
          style={styles.button}
          mode="outlined"
          icon="content-save"
          onPress={async () => {
            await save();
            drawerNavigate("Plans");
          }}
        >
          Save
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    marginBottom: MARGIN,
  },
  button: {},
});
