import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useState } from "react";
import { View } from "react-native";
import DocumentPicker from "react-native-document-picker";
import { Button, Card, IconButton, TouchableRipple } from "react-native-paper";
import { In } from "typeorm";
import AppInput from "./AppInput";
import { StackParams } from "./AppStack";
import ConfirmDialog from "./ConfirmDialog";
import Select from "./Select";
import StackHeader from "./StackHeader";
import { MARGIN, PADDING } from "./constants";
import { setRepo, settingsRepo } from "./db";
import { DrawerParams } from "./drawer-params";
import GymSet from "./gym-set";
import Settings from "./settings";
import PrimaryButton from "./PrimaryButton";
import { fixNumeric } from "./fix-numeric";
import { toast } from "./toast";

export default function EditSets() {
  const { params } = useRoute<RouteProp<StackParams, "EditSets">>();
  const { ids } = params;
  const { navigate } = useNavigation<NavigationProp<DrawerParams>>();
  const [settings, setSettings] = useState<Settings>({} as Settings);
  const [name, setName] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [newImage, setNewImage] = useState("");
  const [unit, setUnit] = useState("");
  const [showRemove, setShowRemove] = useState(false);
  const [names, setNames] = useState("");
  const [oldReps, setOldReps] = useState("");
  const [weights, setWeights] = useState("");
  const [units, setUnits] = useState("");

  const [selection, setSelection] = useState({
    start: 0,
    end: 1,
  });

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({ where: {} }).then(setSettings);
      setRepo.find({ where: { id: In(ids) } }).then((sets) => {
        setNames(sets.map((set) => set.name).join(", "));
        setOldReps(sets.map((set) => set.reps).join(", "));
        setWeights(sets.map((set) => set.weight).join(", "));
        setUnits(sets.map((set) => set.unit).join(", "));
      });
    }, [ids])
  );

  const save = async () => {
    console.log(`${EditSets.name}.save:`, { uri: newImage, name });
    const update: Partial<GymSet> = {};
    if (name) update.name = name;
    if (reps) update.reps = Number(reps);
    if (weight) update.weight = Number(weight);
    if (unit) update.unit = unit;
    if (newImage) update.image = newImage;
    if (Object.keys(update).length > 0) await setRepo.update(ids, update);
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
    setShowRemove(false);
  }, []);

  return (
    <>
      <StackHeader title={`Edit ${ids.length} sets`} />

      <View style={{ padding: PADDING, flex: 1 }}>
        <AppInput
          label={`Names: ${names}`}
          value={name}
          onChangeText={setName}
          autoCorrect={false}
          autoFocus={!name}
        />

        <View>
          <AppInput
            label={`Reps: ${oldReps}`}
            keyboardType="numeric"
            value={reps}
            onChangeText={(newReps) => {
              const fixed = fixNumeric(newReps);
              setReps(fixed.replace(/-/g, ''))
              if (fixed.length !== newReps.length)
                toast("Reps must be a number");
              else if (fixed.includes('-'))
                toast("Reps must be a positive value")
            }}
            selection={selection}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            autoFocus={!!name}
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
            label={`Weights: ${weights}`}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            onSubmitEditing={save}
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
              { label: "", value: "" },
              { label: "kg", value: "kg" },
              { label: "lb", value: "lb" },
              { label: "stone", value: "stone" },
            ]}
            label={`Units: ${units}`}
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
        <ConfirmDialog
          title="Remove image"
          onOk={handleRemove}
          show={showRemove}
          setShow={setShowRemove}
        >
          Are you sure you want to remove the image?
        </ConfirmDialog>

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
        icon="content-save"
        style={{ margin: MARGIN }}
        onPress={save}
      >
        Save
      </PrimaryButton>
    </>
  );
}
