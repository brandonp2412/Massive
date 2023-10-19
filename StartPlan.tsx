import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, NativeModules, TextInput, View } from "react-native";
import { Button, IconButton, ProgressBar } from "react-native-paper";
import AppInput from "./AppInput";
import { getBestSet } from "./best.service";
import { MARGIN, PADDING } from "./constants";
import CountMany from "./count-many";
import { AppDataSource } from "./data-source";
import { getNow, setRepo, settingsRepo } from "./db";
import { emitter } from "./emitter";
import { fixNumeric } from "./fix-numeric";
import GymSet, { GYM_SET_CREATED } from "./gym-set";
import { PlanPageParams } from "./plan-page-params";
import Settings from "./settings";
import StackHeader from "./StackHeader";
import StartPlanItem from "./StartPlanItem";
import { toast } from "./toast";

export default function StartPlan() {
  const { params } = useRoute<RouteProp<PlanPageParams, "StartPlan">>();
  const [reps, setReps] = useState(params.first?.reps.toString() || "0");
  const [weight, setWeight] = useState(params.first?.weight.toString() || "0");
  const [unit, setUnit] = useState<string>(params.first?.unit || "kg");
  const [selected, setSelected] = useState(0);
  const [settings, setSettings] = useState<Settings>();
  const [counts, setCounts] = useState<CountMany[]>();
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const unitRef = useRef<TextInput>(null);
  const workouts = useMemo(() => params.plan.workouts.split(","), [params]);
  const navigation = useNavigation<NavigationProp<PlanPageParams>>();

  const [selection, setSelection] = useState({
    start: 0,
    end: 0,
  });

  const refresh = useCallback(async () => {
    const questions = workouts
      .map((workout, index) => `('${workout}',${index})`)
      .join(",");
    const select = `
      SELECT workouts.name, COUNT(sets.id) as total, sets.sets
      FROM (select 0 as name, 0 as sequence union values ${questions}) as workouts 
      LEFT JOIN sets ON sets.name = workouts.name 
        AND sets.created LIKE STRFTIME('%Y-%m-%d%%', 'now', 'localtime')
        AND NOT sets.hidden
      GROUP BY workouts.name
      ORDER BY workouts.sequence
      LIMIT -1
      OFFSET 1
    `;
    const newCounts = await AppDataSource.manager.query(select);
    console.log(`${StartPlan.name}.focus:`, { newCounts });
    setCounts(newCounts);
  }, [workouts]);

  const select = useCallback(
    async (index: number, newCounts?: CountMany[]) => {
      setSelected(index);
      if (!counts && !newCounts) return;
      const workout = counts ? counts[index] : newCounts[index];
      console.log(`${StartPlan.name}.next:`, { workout });
      const last = await setRepo.findOne({
        where: { name: workout.name },
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
    }, [refresh])
  );

  const handleSubmit = async () => {
    const now = await getNow();
    const workout = counts[selected];
    const best = await getBestSet(workout.name);
    delete best.id;
    const newSet: GymSet = {
      ...best,
      weight: +weight,
      reps: +reps,
      unit,
      created: now,
      hidden: false,
    };
    const saved = await setRepo.save(newSet);
    emitter.emit(GYM_SET_CREATED, saved);
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
          <View
            style={{
              flexDirection: "row",
              marginBottom: MARGIN,
            }}
          >
            <AppInput
              label="Reps"
              style={{ flex: 1 }}
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
            <IconButton
              icon="plus"
              onPress={() => setReps((Number(reps) + 1).toString())}
            />
            <IconButton
              icon="minus"
              onPress={() => setReps((Number(reps) - 1).toString())}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              marginBottom: MARGIN,
            }}
          >
            <AppInput
              label="Weight"
              style={{ flex: 1 }}
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
            <IconButton
              icon="plus"
              onPress={() => setWeight((Number(weight) + 2.5).toString())}
            />
            <IconButton
              icon="minus"
              onPress={() => setWeight((Number(weight) - 2.5).toString())}
            />
          </View>

          {settings?.showUnit && (
            <AppInput
              autoCapitalize="none"
              label="Unit"
              value={unit}
              onChangeText={setUnit}
              innerRef={unitRef}
            />
          )}
          {counts && (
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
