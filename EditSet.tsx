import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { format } from "date-fns";
import { useCallback, useRef, useState } from "react";
import { NativeModules, TextInput, View } from "react-native";
import DocumentPicker from "react-native-document-picker";
import {
  Button,
  Card,
  IconButton,
  Menu,
  TouchableRipple,
} from "react-native-paper";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import AppInput from "./AppInput";
import { StackParams } from "./AppStack";
import ConfirmDialog from "./ConfirmDialog";
import { MARGIN, PADDING } from "./constants";
import { convert } from "./conversions";
import { getNow, setRepo, settingsRepo } from "./db";
import { DrawerParams } from "./drawer-params";
import { fixNumeric } from "./fix-numeric";
import GymSet from "./gym-set";
import Select from "./Select";
import Settings from "./settings";
import StackHeader from "./StackHeader";
import { toast } from "./toast";
import PrimaryButton from "./PrimaryButton";

export default function EditSet() {
  const { params } = useRoute<RouteProp<StackParams, "EditSet">>();
  const { set } = params;
  const { navigate } = useNavigation<NavigationProp<DrawerParams>>();
  const [settings, setSettings] = useState<Settings>({} as Settings);
  const [name, setName] = useState(set.name);
  const [reps, setReps] = useState(set.reps?.toString());
  const [weight, setWeight] = useState(set.weight?.toString());
  const [newImage, setNewImage] = useState(set.image);
  const [unit, setUnit] = useState(set.unit);
  const [showDelete, setShowDelete] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [created, setCreated] = useState<Date>(
    set.created ? new Date(set.created) : new Date()
  );
  const [createdDirty, setCreatedDirty] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const [setOptions, setSets] = useState<GymSet[]>([]);
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);

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
      console.log(`${EditSet.name}.timer:`, { milliseconds });
      const canNotify = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      if (canNotify === RESULTS.DENIED)
        await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      if (milliseconds) NativeModules.AlarmModule.timer(milliseconds);
    },
    [settings]
  );

  const notify = (value: Partial<GymSet>) => {
    if (!settings.notify) return navigate("History");
    if (
      value.weight > set.weight ||
      (value.reps > set.reps && value.weight === set.weight)
    ) {
      toast("Great work King! That's a new record.");
    }
  };

  const added = async (value: GymSet) => {
    console.log(`${EditSet.name}.added:`, value);
    startTimer(value.name);
  };

  const handleSubmit = async () => {
    if (!name) return;

    let newWeight = Number(weight);
    let newUnit = unit;
    if (settings.autoConvert && unit !== settings.autoConvert) {
      newUnit = settings.autoConvert;
      newWeight = convert(newWeight, unit, settings.autoConvert);
    }

    const newSet: Partial<GymSet> = {
      id: set.id,
      name,
      reps: Number(reps || 0),
      weight: newWeight,
      unit: newUnit,
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
    notify(newSet);
    if (typeof set.id !== "number") added(saved);
    navigate("History");
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

  const remove = async () => {
    await setRepo.delete(set.id);
    navigate("History");
  };

  const openMenu = async () => {
    if (setOptions.length > 0) return setShowMenu(true);
    const latestSets = await setRepo
      .createQueryBuilder()
      .select()
      .addSelect("MAX(created) as created")
      .groupBy("name")
      .getMany();
    setSets(latestSets);
    setShowMenu(true);
  };

  const select = (setOption: GymSet) => {
    setName(setOption.name);
    setReps(setOption.reps.toString());
    setWeight(setOption.weight.toString());
    setNewImage(setOption.image);
    setUnit(setOption.unit);
    setSelection({
      start: 0,
      end: setOption.reps.toString().length,
    });
    setShowMenu(false);
  };

  return (
    <>
      <StackHeader title={typeof set.id === "number" ? "Edit set" : "Add set"}>
        {typeof set.id === "number" ? (
          <IconButton onPress={() => setShowDelete(true)} icon="delete" />
        ) : null}
      </StackHeader>
      <ConfirmDialog
        title="Delete set"
        show={showDelete}
        onOk={remove}
        setShow={setShowDelete}
      >
        <>Are you sure you want to delete {name}</>
      </ConfirmDialog>

      <View style={{ padding: PADDING, flex: 1 }}>
        <View>
          <AppInput
            label="Name"
            value={name}
            onChangeText={setName}
            autoCorrect={false}
            autoFocus={!name}
            onSubmitEditing={() => repsRef.current?.focus()}
          />
          <View
            style={{ position: "absolute", right: 0, flexDirection: "row" }}
          >
            <Menu
              visible={showMenu}
              onDismiss={() => setShowMenu(false)}
              anchor={<IconButton icon="menu-down" onPress={openMenu} />}
            >
              {setOptions.map((setOption) => (
                <Menu.Item
                  title={setOption.name}
                  key={setOption.id}
                  onPress={() => select(setOption)}
                />
              ))}
            </Menu>
          </View>
        </View>

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

        {settings.showUnit && (
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
            icon="image-plus"
          >
            Image
          </Button>
        )}
      </View>

      <PrimaryButton
        disabled={!name}
        icon="content-save"
        style={{ margin: MARGIN }}
        onPress={handleSubmit}
      >
        Save
      </PrimaryButton>

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
