import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import DocumentPicker from "react-native-document-picker";
import { Button, Card, TouchableRipple } from "react-native-paper";
import { In } from "typeorm";
import AppInput from "./AppInput";
import { StackParams } from "./AppStack";
import ConfirmDialog from "./ConfirmDialog";
import StackHeader from "./StackHeader";
import { MARGIN, PADDING } from "./constants";
import { planRepo, setRepo, settingsRepo } from "./db";
import { DrawerParams } from "./drawer-params";
import { fixNumeric } from "./fix-numeric";
import Settings from "./settings";
import { toast } from "./toast";

export default function EditExercises() {
  const { params } = useRoute<RouteProp<StackParams, "EditExercises">>();
  const [removeImage, setRemoveImage] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [name, setName] = useState("");
  const [oldNames, setOldNames] = useState(params.names.join(", "));
  const [steps, setSteps] = useState("");
  const [oldSteps, setOldSteps] = useState("");
  const [uri, setUri] = useState("");
  const [minutes, setMinutes] = useState("");
  const [oldMinutes, setOldMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [oldSeconds, setOldSeconds] = useState("");
  const [sets, setSets] = useState("");
  const [oldSets, setOldSets] = useState("");
  const navigation = useNavigation<NavigationProp<DrawerParams>>();
  const setsRef = useRef<TextInput>(null);
  const stepsRef = useRef<TextInput>(null);
  const minutesRef = useRef<TextInput>(null);
  const secondsRef = useRef<TextInput>(null);
  const [settings, setSettings] = useState<Settings>();

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({ where: {} }).then(setSettings);
      setRepo
        .createQueryBuilder()
        .select()
        .where("name IN (:...names)", { names: params.names })
        .groupBy("name")
        .getMany()
        .then((gymSets) => {
          console.log({ gymSets });
          setOldNames(gymSets.map((set) => set.name).join(", "));
          setOldSteps(gymSets.map((set) => set.steps).join(", "));
          setOldMinutes(gymSets.map((set) => set.minutes).join(", "));
          setOldSeconds(gymSets.map((set) => set.seconds).join(", "));
          setOldSets(gymSets.map((set) => set.sets).join(", "));
        });
    }, [params.names])
  );

  const update = async () => {
    await setRepo.update(
      { name: In(params.names) },
      {
        name: name || undefined,
        sets: sets ? Number(sets) : undefined,
        minutes: minutes ? Number(minutes) : undefined,
        seconds: seconds ? Number(seconds) : undefined,
        steps: steps || undefined,
        image: removeImage ? "" : uri,
      }
    );
    for (const oldName of params.names) {
      await planRepo
        .createQueryBuilder()
        .update()
        .set({
          exercises: () => `REPLACE(exercises, '${oldName}', '${name}')`,
        })
        .where("exercises LIKE :name", { name: `%${oldName}%` })
        .execute();
    }
    navigation.navigate("Exercises");
  };

  const changeImage = useCallback(async () => {
    const { fileCopyUri } = await DocumentPicker.pickSingle({
      type: DocumentPicker.types.images,
      copyTo: "documentDirectory",
    });
    if (fileCopyUri) setUri(fileCopyUri);
  }, []);

  const handleRemove = useCallback(async () => {
    setUri("");
    setRemoveImage(true);
    setShowRemove(false);
  }, []);

  const submitName = () => {
    if (settings.steps) stepsRef.current?.focus();
    else setsRef.current?.focus();
  };

  return (
    <>
      <StackHeader title={`Edit ${params.names.length} exercises`} />
      <View style={{ padding: PADDING, flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <AppInput
            autoFocus
            label={`Names: ${oldNames}`}
            value={name}
            onChangeText={setName}
            onSubmitEditing={submitName}
          />
          {settings?.steps && (
            <AppInput
              innerRef={stepsRef}
              selectTextOnFocus={false}
              value={steps}
              onChangeText={setSteps}
              label={`Steps: ${oldSteps}`}
              multiline
              onSubmitEditing={() => setsRef.current?.focus()}
            />
          )}
          <AppInput
            innerRef={setsRef}
            value={sets}
            onChangeText={(newSets) => {
              const fixed = fixNumeric(newSets);
              setSets(fixed);
              if (fixed.length !== newSets.length)
                toast("Sets must be a number");
            }}
            label={`Sets: ${oldSets}`}
            keyboardType="numeric"
            onSubmitEditing={() => minutesRef.current?.focus()}
          />
          {settings?.alarm && (
            <>
              <AppInput
                innerRef={minutesRef}
                onSubmitEditing={() => secondsRef.current?.focus()}
                value={minutes}
                onChangeText={(newMinutes) => {
                  const fixed = fixNumeric(newMinutes);
                  setMinutes(fixed);
                  if (fixed.length !== newMinutes.length)
                    toast("Reps must be a number");
                }}
                label={`Rest minutes: ${oldMinutes}`}
                keyboardType="numeric"
              />
              <AppInput
                innerRef={secondsRef}
                value={seconds}
                onChangeText={setSeconds}
                label={`Rest seconds: ${oldSeconds}`}
                keyboardType="numeric"
                blurOnSubmit
              />
            </>
          )}
          {settings?.images && uri && (
            <TouchableRipple
              style={{ marginBottom: MARGIN }}
              onPress={changeImage}
              onLongPress={() => setShowRemove(true)}
            >
              <Card.Cover source={{ uri }} />
            </TouchableRipple>
          )}
          {settings?.images && !uri && (
            <Button
              style={{ marginBottom: MARGIN }}
              onPress={changeImage}
              icon="image-plus"
            >
              Image
            </Button>
          )}
        </ScrollView>
        <Button
          disabled={!name}
          mode="contained"
          icon="content-save"
          onPress={update}
        >
          Save
        </Button>
        <ConfirmDialog
          title="Remove image"
          onOk={handleRemove}
          show={showRemove}
          setShow={setShowRemove}
        >
          Are you sure you want to remove the image?
        </ConfirmDialog>
      </View>
    </>
  );
}
