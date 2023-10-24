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
import { TextInput, View } from "react-native";
import { Button, IconButton } from "react-native-paper";
import AppInput from "./AppInput";
import ConfirmDialog from "./ConfirmDialog";
import { MARGIN, PADDING } from "./constants";
import { getNow, settingsRepo, weightRepo } from "./db";
import Settings from "./settings";
import StackHeader from "./StackHeader";
import Weight from "./weight";
import { WeightPageParams } from "./WeightPage";

export default function EditWeight() {
  const { params } = useRoute<RouteProp<WeightPageParams, "EditWeight">>();
  const { weight } = params;
  const { navigate } = useNavigation<NavigationProp<WeightPageParams>>();
  const [settings, setSettings] = useState<Settings>({} as Settings);
  const [value, setValue] = useState(weight.value?.toString());
  const [unit, setUnit] = useState(weight.unit);
  const [created, setCreated] = useState<Date>(
    weight.created ? new Date(weight.created) : new Date()
  );
  const [showDelete, setShowDelete] = useState(false);
  const [createdDirty, setCreatedDirty] = useState(false);
  const unitRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      settingsRepo.findOne({ where: {} }).then(setSettings);
    }, [])
  );

  const submit = async () => {
    if (!value) return;

    const newWeight: Partial<Weight> = {
      id: weight.id,
      value: Number(value),
      unit,
    };

    if (createdDirty) newWeight.created = created.toISOString();
    else if (typeof weight.id !== "number") newWeight.created = await getNow();

    await weightRepo.save(newWeight);
    navigate("Weights");
  };

  const pickDate = useCallback(() => {
    DateTimePickerAndroid.open({
      value: created,
      onChange: (_, date) => {
        if (date === created) return;
        setCreated(date);
        setCreatedDirty(true);
      },
      mode: "date",
    });
  }, [created]);

  const remove = async () => {
    if (!weight.id) return;
    await weightRepo.delete(weight.id);
    navigate("Weights");
  };

  return (
    <>
      <StackHeader
        title={typeof weight.id === "number" ? "Edit weight" : "Add weight"}
      >
        {typeof weight.id === "number" ? (
          <IconButton onPress={() => setShowDelete(true)} icon="delete" />
        ) : null}
      </StackHeader>
      <ConfirmDialog
        title="Delete weight"
        show={showDelete}
        onOk={remove}
        setShow={setShowDelete}
      >
        <>Are you sure you want to delete {value}</>
      </ConfirmDialog>

      <View style={{ padding: PADDING, flex: 1 }}>
        <AppInput
          label="Weight"
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
          onSubmitEditing={submit}
        />

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
      </View>

      <Button
        disabled={!value}
        mode="outlined"
        icon="content-save"
        style={{ margin: MARGIN }}
        onPress={submit}
      >
        Save
      </Button>
    </>
  );
}
