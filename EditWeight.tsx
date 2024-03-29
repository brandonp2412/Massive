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
import { IconButton } from "react-native-paper";
import AppInput from "./AppInput";
import { StackParams } from "./AppStack";
import ConfirmDialog from "./ConfirmDialog";
import PrimaryButton from "./PrimaryButton";
import Select from "./Select";
import StackHeader from "./StackHeader";
import { MARGIN, PADDING } from "./constants";
import { AppDataSource } from "./data-source";
import { getNow, settingsRepo, weightRepo } from "./db";
import { DrawerParams } from "./drawer-params";
import Settings from "./settings";
import { toast } from "./toast";
import Weight from "./weight";

export default function EditWeight() {
  const { params } = useRoute<RouteProp<StackParams, "EditWeight">>();
  const { weight } = params;
  const { navigate } = useNavigation<NavigationProp<DrawerParams>>();
  const { navigate: stackNavigate, goBack } = useNavigation<NavigationProp<StackParams>>();
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
    if (settings.notify) await checkWeekly();
    goBack();
    stackNavigate("ViewWeightGraph");
  };

  const checkWeekly = async () => {
    const select = `
      WITH weekly_weights AS (
          SELECT
              strftime('%W', created) AS week_number,
              AVG(value) AS weekly_average
          FROM weights
          WHERE strftime('%W', created) = strftime('%W', 'now')
          GROUP BY week_number
      )
      SELECT
          ((SELECT value FROM weights WHERE strftime('%W', created) = strftime('%W', 'now') ORDER BY created LIMIT 1) - weekly_weights.weekly_average) / (SELECT value FROM weights WHERE strftime('%W', created) = strftime('%W', 'now') ORDER BY created LIMIT 1) * 100 AS loss
      FROM weekly_weights
      WHERE week_number = strftime('%W', 'now')
    `;
    const result = await AppDataSource.manager.query(select);
    console.log(`${EditWeight.name}.checkWeekly:`, result);
    if (result.length && result[0].loss > 1)
      toast("Weight loss should be <= 1% per week.");
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
    navigate("Weight");
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
          autoFocus
        />

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
            value={format(created, settings.date || "Pp")}
            onPressOut={pickDate}
          />
        )}
      </View>

      <PrimaryButton
        disabled={!value}
        icon="content-save"
        style={{ margin: MARGIN }}
        onPress={submit}
      >
        Save
      </PrimaryButton>
    </>
  );
}
