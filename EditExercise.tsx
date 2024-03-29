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
import { Button, Card, IconButton, TouchableRipple } from "react-native-paper";
import AppInput from "./AppInput";
import { StackParams } from "./AppStack";
import ConfirmDialog from "./ConfirmDialog";
import PrimaryButton from "./PrimaryButton";
import StackHeader from "./StackHeader";
import { MARGIN, PADDING } from "./constants";
import { getNow, planRepo, setRepo, settingsRepo } from "./db";
import { DrawerParams } from "./drawer-params";
import { fixNumeric } from "./fix-numeric";
import GymSet, { defaultSet } from "./gym-set";
import Settings from "./settings";
import { toast } from "./toast";

export default function EditExercise() {
  const { params } = useRoute<RouteProp<StackParams, "EditExercise">>();
  const [removeImage, setRemoveImage] = useState(false);
  const [showRemoveImage, setShowRemoveImage] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [name, setName] = useState(params.gymSet.name);
  const [steps, setSteps] = useState(params.gymSet.steps);
  const [uri, setUri] = useState(params.gymSet.image);
  const [minutes, setMinutes] = useState(
    params.gymSet.minutes?.toString() ?? "3"
  );
  const [seconds, setSeconds] = useState(
    params.gymSet.seconds?.toString() ?? "30"
  );
  const [sets, setSets] = useState(params.gymSet.sets?.toString() ?? "3");
  const { navigate } = useNavigation<NavigationProp<DrawerParams>>();
  const setsRef = useRef<TextInput>(null);
  const stepsRef = useRef<TextInput>(null);
  const minutesRef = useRef<TextInput>(null);
  const secondsRef = useRef<TextInput>(null);
  const [settings, setSettings] = useState<Settings>();

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({ where: {} }).then((gotSettings) => {
        setSettings(gotSettings);
        if (params.gymSet.id) return;
        setSets(gotSettings.defaultSets?.toString() ?? "3");
        setMinutes(gotSettings.defaultMinutes?.toString() ?? "3");
        setSeconds(gotSettings.defaultSeconds?.toString() ?? "30");
      });
    }, [params.gymSet.id])
  );

  const update = async () => {
    const newExercise = {
      name: name || params.gymSet.name,
      sets: Number(sets),
      minutes: Number(minutes),
      seconds: Number(seconds),
      steps,
      image: removeImage ? "" : uri,
    } as GymSet;
    await setRepo.update({ name: params.gymSet.name }, newExercise);
    await planRepo.query(
      `UPDATE plans 
       SET exercises = REPLACE(exercises, $1, $2) 
       WHERE exercises LIKE $3`,
      [params.gymSet.name, name, `%${params.gymSet.name}%`]
    );
    navigate("Exercises", { update: newExercise });
  };

  const add = async () => {
    const now = await getNow();
    await setRepo.save({
      ...defaultSet,
      name,
      hidden: true,
      image: uri,
      minutes: minutes ? Number(minutes) : 3,
      seconds: seconds ? Number(seconds) : 30,
      sets: sets ? Number(sets) : 3,
      steps,
      created: now,
    });
    navigate("Exercises");
  };

  const remove = async () => {
    await setRepo.delete({ name: params.gymSet.name });
    navigate("Exercises");
  };

  const save = async () => {
    if (params.gymSet.name) return update();
    return add();
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
    setShowRemoveImage(false);
  }, []);

  const submitName = () => {
    if (settings.steps) stepsRef.current?.focus();
    else setsRef.current?.focus();
  };

  return (
    <>
      <StackHeader
        title={params.gymSet.name ? "Edit exercise" : "Add exercise"}
      >
        {typeof params.gymSet.id === "number" ? (
          <IconButton onPress={() => setShowDelete(true)} icon="delete" />
        ) : null}
      </StackHeader>
      <View style={{ padding: PADDING, flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <AppInput
            autoFocus
            label="Name"
            value={name}
            onChangeText={setName}
            onSubmitEditing={submitName}
          />
          <AppInput
            innerRef={stepsRef}
            selectTextOnFocus={false}
            value={steps}
            onChangeText={setSteps}
            label="Steps"
            multiline
            onSubmitEditing={() => setsRef.current?.focus()}
          />
          <AppInput
            innerRef={setsRef}
            value={sets}
            onChangeText={(newSets) => {
              const fixed = fixNumeric(newSets);
              setSets(fixed);
              if (fixed.length !== newSets.length)
                toast("Sets must be a number");
            }}
            label="Sets per exercise"
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
                label="Rest minutes"
                keyboardType="numeric"
              />
              <AppInput
                innerRef={secondsRef}
                value={seconds}
                onChangeText={setSeconds}
                label="Rest seconds"
                keyboardType="numeric"
                blurOnSubmit
              />
            </>
          )}
          {settings?.images && uri && (
            <TouchableRipple
              style={{ marginBottom: MARGIN }}
              onPress={changeImage}
              onLongPress={() => setShowRemoveImage(true)}
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
        <PrimaryButton disabled={!name} icon="content-save" onPress={save}>
          Save
        </PrimaryButton>

        <ConfirmDialog
          title="Remove image"
          onOk={handleRemove}
          show={showRemoveImage}
          setShow={setShowRemoveImage}
        >
          Are you sure you want to remove the image?
        </ConfirmDialog>

        <ConfirmDialog
          title="Delete set"
          show={showDelete}
          onOk={remove}
          setShow={setShowDelete}
        >
          <>Are you sure you want to delete {name}</>
        </ConfirmDialog>
      </View>
    </>
  );
}
