import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { format } from "date-fns";
import { useCallback, useRef, useState } from "react";
import { NativeModules, TextInput, View } from "react-native";
import DocumentPicker from "react-native-document-picker";
import { Button, Card, IconButton, TouchableRipple } from "react-native-paper";
import AppInput from "./AppInput";
import ConfirmDialog from "./ConfirmDialog";
import { MARGIN, PADDING } from "./constants";
import { getNow, setRepo, settingsRepo } from "./db";
import GymSet from "./gym-set";
import { HomePageParams } from "./home-page-params";
import Settings from "./settings";
import StackHeader from "./StackHeader";
import { toast } from "./toast";
import { fixNumeric } from "./fix-numeric";

export default function EditSet() {
  const { params } = useRoute<RouteProp<HomePageParams, "EditSet">>();
  const { set } = params;
  const navigation = useNavigation();
  const [settings, setSettings] = useState<Settings>({} as Settings);
  const [name, setName] = useState(set.name);
  const [reps, setReps] = useState(set.reps?.toString());
  const [weight, setWeight] = useState(set.weight?.toString());
  const [newImage, setNewImage] = useState(set.image);
  const [unit, setUnit] = useState(set.unit);
  const [created, setCreated] = useState<Date>(
    set.created ? new Date(set.created) : new Date()
  );
  const [createdDirty, setCreatedDirty] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const unitRef = useRef<TextInput>(null);

  const [selection, setSelection] = useState({
    start: 0,
    end: set.reps?.toString().length,
  });

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({ where: {} }).then(setSettings);
    }, [])
  );

  const startTimer = useCallback(
    async (value: string) => {
      if (!settings.alarm) return;
      const first = await setRepo.findOne({ where: { name: value } });
      const milliseconds =
        (first?.minutes ?? 3) * 60 * 1000 + (first?.seconds ?? 0) * 1000;
      if (milliseconds) NativeModules.AlarmModule.timer(milliseconds);
    },
    [settings]
  );

  const added = useCallback(
    async (value: GymSet) => {
      startTimer(value.name);
      console.log(`${EditSet.name}.add`, { set: value });
      if (!settings.notify) return;
      if (
        value.weight > set.weight ||
        (value.reps > set.reps && value.weight === set.weight)
      ) {
        toast("Great work King! That's a new record.");
      }
    },
    [startTimer, set, settings]
  );

  const handleSubmit = async () => {
    if (!name) return;

    const newSet: Partial<GymSet> = {
      id: set.id,
      name,
      reps: Number(reps),
      weight: Number(weight),
      unit,
      minutes: Number(set.minutes ?? 3),
      seconds: Number(set.seconds ?? 30),
      sets: set.sets ?? 3,
      hidden: false,
    };

    newSet.image = newImage;
    if (!newImage && !removeImage) {
      newSet.image = await setRepo
        .findOne({ where: { name } })
        .then((s) => s?.image);
    }

    if (createdDirty) newSet.created = created.toISOString();
    if (typeof set.id !== "number") newSet.created = await getNow();

    const saved = await setRepo.save(newSet);
    if (typeof set.id !== "number") added(saved);
    navigation.goBack();
  };

  const changeImage = useCallback(async () => {
    const { fileCopyUri } = await DocumentPicker.pickSingle({
      type: DocumentPicker.types.images,
      copyTo: "documentDirectory",
    });
    if (fileCopyUri) setNewImage(fileCopyUri);
  }, []);

  const handleRemove = useCallback(async () => {
    setNewImage("");
    setRemoveImage(true);
    setShowRemove(false);
  }, []);

  const pickDate = useCallback(() => {
    DateTimePickerAndroid.open({
      value: created,
      onChange: (_, date) => {
        if (date === created) return;
        setCreated(date);
        setCreatedDirty(true);
        DateTimePickerAndroid.open({
          value: date,
          onChange: (__, time) => setCreated(time),
          mode: "time",
        });
      },
      mode: "date",
    });
  }, [created]);

  return (
    <>
      <StackHeader
        title={typeof set.id === "number" ? "Edit set" : "Add set"}
      />

      <View style={{ padding: PADDING, flex: 1 }}>
        <AppInput
          label="Name"
          value={name}
          onChangeText={setName}
          autoCorrect={false}
          autoFocus={!name}
          onSubmitEditing={() => repsRef.current?.focus()}
        />

        <View style={{ flexDirection: "row" }}>
          <AppInput
            style={{
              flex: 1,
              marginBottom: MARGIN,
            }}
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
          <IconButton
            icon="add"
            onPress={() => setReps((Number(reps) + 1).toString())}
          />
          <IconButton
            icon="remove"
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
            style={{ flex: 1 }}
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
          />
          <IconButton
            icon="add"
            onPress={() => setWeight((Number(weight) + 2.5).toString())}
          />
          <IconButton
            icon="remove"
            onPress={() => setWeight((Number(weight) - 2.5).toString())}
          />
        </View>

        {settings.showUnit && (
          <AppInput
            autoCapitalize="none"
            label="Unit"
            value={unit}
            onChangeText={setUnit}
            innerRef={unitRef}
          />
        )}

        {settings.showDate && (
          <AppInput
            label="Created"
            value={format(created, settings.date || "P")}
            onPressOut={pickDate}
          />
        )}

        {settings.images && newImage && (
          <TouchableRipple
            style={{ marginBottom: MARGIN }}
            onPress={changeImage}
            onLongPress={() => setShowRemove(true)}
          >
            <Card.Cover source={{ uri: newImage }} />
          </TouchableRipple>
        )}

        {settings.images && !newImage && (
          <Button
            style={{ marginBottom: MARGIN }}
            onPress={changeImage}
            icon="add-photo-alternate"
          >
            Image
          </Button>
        )}
      </View>

      <Button
        disabled={!name}
        mode="outlined"
        icon="save"
        style={{ margin: MARGIN }}
        onPress={handleSubmit}
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
    </>
  );
}
