import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, NativeModules, TextInput, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  IconButton,
  ProgressBar,
} from "react-native-paper";
import AppInput from "./AppInput";
import { StackParams } from "./AppStack";
import { getBestSet } from "./best.service";
import { PADDING } from "./constants";
import CountMany from "./count-many";
import { AppDataSource } from "./data-source";
import { getNow, setRepo, settingsRepo } from "./db";
import { fixNumeric } from "./fix-numeric";
import GymSet from "./gym-set";
import Settings from "./settings";
import StackHeader from "./StackHeader";
import StartPlanItem from "./StartPlanItem";
import { toast } from "./toast";
import { PERMISSIONS, RESULTS, check, request } from "react-native-permissions";
import Select from "./Select";

export default function StartPlan() {
  const { params } = useRoute<RouteProp<StackParams, "StartPlan">>();
  const [reps, setReps] = useState(params.first?.reps.toString() || "0");
  const [weight, setWeight] = useState(params.first?.weight.toString() || "0");
  const [unit, setUnit] = useState<string>(params.first?.unit || "kg");
  const [selected, setSelected] = useState(0);
  const [settings, setSettings] = useState<Settings>();
  const [counts, setCounts] = useState<CountMany[]>();
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const exercises = useMemo(() => params.plan.exercises.split(","), [params]);
  const navigation = useNavigation<NavigationProp<StackParams>>();

  const [selection, setSelection] = useState({
    start: 0,
    end: 0,
  });

  const refresh = useCallback(async () => {
    const questions = exercises
      .map((exercise, index) => `('${exercise}',${index})`)
      .join(",");
    const select = `
      SELECT exercises.name, COUNT(sets.id) as total, sets.sets
      FROM (select 0 as name, 0 as sequence union values ${questions}) as exercises 
      LEFT JOIN sets ON sets.name = exercises.name 
        AND sets.created LIKE STRFTIME('%Y-%m-%d%%', 'now', 'localtime')
        AND NOT sets.hidden
      GROUP BY exercises.name
      ORDER BY exercises.sequence
      LIMIT -1
      OFFSET 1
    `;
    const newCounts = await AppDataSource.manager.query(select);
    console.log(`${StartPlan.name}.focus:`, { newCounts });
    setCounts(newCounts);
  }, [exercises]);

  const select = useCallback(
    async (index: number, newCounts?: CountMany[]) => {
      setSelected(index);
      if (!counts && !newCounts) return;
      const exercise = counts ? counts[index] : newCounts[index];
      console.log(`${StartPlan.name}.next:`, { exercise });
      const last = await setRepo.findOne({
        where: { name: exercise.name },
        order: { created: "desc" },
      });
      console.log({ last });
      if (!last) return;
      delete last.id;
      console.log(`${StartPlan.name}.select:`, { last });
      setReps(last.reps.toString());
      setWeight(last.weight.toString());
      setUnit(last.unit);
    },
    [counts]
  );

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({ where: {} }).then(setSettings);
      refresh();
      // eslint-disable-next-line
    }, [])
  );

  const handleSubmit = async () => {
    const now = await getNow();
    const exercise = counts[selected];
    const best = await getBestSet(exercise.name);
    delete best.id;
    const newSet: GymSet = {
      ...best,
      weight: +weight,
      reps: +reps,
      unit,
      created: now,
      hidden: false,
    };
    await setRepo.save(newSet);
    await refresh();
    if (
      settings.notify &&
      (+weight > best.weight || (+reps > best.reps && +weight === best.weight))
    ) {
      toast("Great work King! That's a new record.");
    }
    if (!settings.alarm) return;
    const milliseconds =
      Number(best.minutes) * 60 * 1000 + Number(best.seconds) * 1000;
    const canNotify = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    if (canNotify === RESULTS.DENIED)
      await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    NativeModules.AlarmModule.timer(milliseconds);
  };

  return (
    <>
      <StackHeader
        title={params.plan.title || params.plan.days.replace(/,/g, ", ")}
      >
        <IconButton
          onPress={() => navigation.navigate("EditPlan", { plan: params.plan })}
          icon="pencil"
        />
      </StackHeader>
      <View style={{ padding: PADDING, flex: 1, flexDirection: "column" }}>
        <View style={{ flex: 1 }}>
          <View>
            <AppInput
              label="Reps"
              keyboardType="numeric"
              value={reps}
              onChangeText={(newReps) => {
                const fixed = fixNumeric(newReps);
                setReps(fixed);
                if (fixed.length !== newReps.length)
                  toast("Reps must be a number");
              }}
              onSubmitEditing={() => weightRef.current?.focus()}
              selection={selection}
              onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
              innerRef={repsRef}
            />
            <View
              style={{ position: "absolute", right: 0, flexDirection: "row" }}
            >
              <IconButton
                icon="plus"
                onPress={() => setReps((Number(reps) + 1).toString())}
              />
              <IconButton
                icon="minus"
                onPress={() => setReps((Number(reps) - 1).toString())}
              />
            </View>
          </View>

          <View>
            <AppInput
              label="Weight"
              keyboardType="numeric"
              value={weight}
              onChangeText={(newWeight) => {
                const fixed = fixNumeric(newWeight);
                setWeight(fixed);
                if (fixed.length !== newWeight.length)
                  toast("Weight must be a number");
              }}
              onSubmitEditing={handleSubmit}
              innerRef={weightRef}
              blurOnSubmit
            />
            <View
              style={{ position: "absolute", right: 0, flexDirection: "row" }}
            >
              <IconButton
                icon="plus"
                onPress={() => setWeight((Number(weight) + 2.5).toString())}
              />
              <IconButton
                icon="minus"
                onPress={() => setWeight((Number(weight) - 2.5).toString())}
              />
            </View>
          </View>

          {settings?.showUnit && (
            <Select
              value={unit}
              onChange={setUnit}
              items={[
                { label: "kg", value: "kg" },
                { label: "lb", value: "lb" },
                { label: "stone", value: "stone" },
              ]}
              label="Unit"
            />
          )}
          {counts === undefined ? (
            <ActivityIndicator />
          ) : (
            <FlatList
              data={counts}
              keyExtractor={(count) => count.name}
              renderItem={(props) => (
                <View>
                  <StartPlanItem
                    {...props}
                    onUndo={refresh}
                    onSelect={select}
                    selected={selected}
                  />
                  <ProgressBar
                    progress={(props.item.total || 0) / (props.item.sets || 3)}
                  />
                </View>
              )}
            />
          )}
        </View>
        <Button mode="outlined" icon="content-save" onPress={handleSubmit}>
          Save
        </Button>
      </View>
    </>
  );
}
