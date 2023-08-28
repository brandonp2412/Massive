import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import DocumentPicker from "react-native-document-picker";
import { Button, Card, TouchableRipple } from "react-native-paper";
import AppInput from "./AppInput";
import ConfirmDialog from "./ConfirmDialog";
import { MARGIN, PADDING } from "./constants";
import { getNow, planRepo, setRepo, settingsRepo } from "./db";
import { fixNumeric } from "./fix-numeric";
import { defaultSet } from "./gym-set";
import Settings from "./settings";
import StackHeader from "./StackHeader";
import { toast } from "./toast";
import { WorkoutsPageParams } from "./WorkoutsPage";

export default function EditWorkout() {
  const { params } = useRoute<RouteProp<WorkoutsPageParams, "EditWorkout">>();
  const [removeImage, setRemoveImage] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
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
  const navigation = useNavigation();
  const setsRef = useRef<TextInput>(null);
  const stepsRef = useRef<TextInput>(null);
  const minutesRef = useRef<TextInput>(null);
  const secondsRef = useRef<TextInput>(null);
  const [settings, setSettings] = useState<Settings>();

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({ where: {} }).then(setSettings);
    }, [])
  );

  const update = async () => {
    await setRepo.update(
      { name: params.gymSet.name },
      {
        name: name || params.gymSet.name,
        sets: Number(sets),
        minutes: +minutes,
        seconds: +seconds,
        steps,
        image: removeImage ? "" : uri,
      }
    );
    await planRepo.query(
      `UPDATE plans 
       SET workouts = REPLACE(workouts, $1, $2) 
       WHERE workouts LIKE $3`,
      [params.gymSet.name, name, `%${params.gymSet.name}%`]
    );
    navigation.goBack();
  };

  const add = async () => {
    const now = await getNow();
    await setRepo.save({
      ...defaultSet,
      name,
      hidden: true,
      image: uri,
      minutes: minutes ? +minutes : 3,
      seconds: seconds ? +seconds : 30,
      sets: sets ? +sets : 3,
      steps,
      created: now,
    });
    navigation.goBack();
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
    setShowRemove(false);
  }, []);

  const submitName = () => {
    if (settings.steps) stepsRef.current?.focus();
    else setsRef.current?.focus();
  };

  return (
    <>
      <StackHeader
        title={params.gymSet.name ? "Edit workout" : "Add workout"}
      />
      <View style={{ padding: PADDING, flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <AppInput
            autoFocus
            label="Name"
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
              label="Steps"
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
            label="Sets per workout"
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
              onLongPress={() => setShowRemove(true)}
            >
              <Card.Cover source={{ uri }} />
            </TouchableRipple>
          )}
          {settings?.images && !uri && (
            <Button
              style={{ marginBottom: MARGIN }}
              onPress={changeImage}
              icon="add-photo-alternate"
            >
              Image
            </Button>
          )}
        </ScrollView>
        <Button disabled={!name} mode="outlined" icon="save" onPress={save}>
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
