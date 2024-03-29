import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { List } from "react-native-paper";
import { Like } from "typeorm";
import { StackParams } from "./AppStack";
import { planRepo } from "./db";
import DrawerHeader from "./DrawerHeader";
import ListMenu from "./ListMenu";
import Page from "./Page";
import { defaultPlan, Plan } from "./plan";
import PlanItem from "./PlanItem";

export default function PlanList() {
  const [term, setTerm] = useState("");
  const [plans, setPlans] = useState<Plan[]>();
  const [ids, setIds] = useState<number[]>([]);
  const navigation = useNavigation<NavigationProp<StackParams>>();

  const refresh = useCallback(async (value: string) => {
    console.log(`${PlanList.name}.refresh:`, value);
    planRepo
      .find({
        where: [
          { title: Like(`%${value.trim()}%`) },
          { days: Like(`%${value.trim()}%`) },
          { exercises: Like(`%${value.trim()}%`) },
        ],
      })
      .then(setPlans);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh(term);
      // eslint-disable-next-line
    }, [term])
  );

  const search = useCallback(
    (value: string) => {
      setTerm(value);
      refresh(value);
    },
    [refresh]
  );

  const renderItem = useCallback(
    ({ item }: { item: Plan }) => (
      <PlanItem ids={ids} setIds={setIds} item={item} key={item.id} />
    ),
    [ids]
  );

  const onAdd = () =>
    navigation.navigate("EditPlan", {
      plan: defaultPlan,
    });

  const edit = useCallback(async () => {
    const plan = await planRepo.findOne({ where: { id: ids.pop() } });
    navigation.navigate("EditPlan", { plan });
    setIds([]);
  }, [ids, navigation]);

  const copy = useCallback(async () => {
    const plan = await planRepo.findOne({
      where: { id: ids.pop() },
    });
    delete plan.id;
    navigation.navigate("EditPlan", { plan });
    setIds([]);
  }, [ids, navigation]);

  const clear = useCallback(() => {
    setIds([]);
  }, []);

  const remove = useCallback(async () => {
    await planRepo.delete(ids.length > 0 ? ids : {});
    await refresh(term);
    setIds([]);
  }, [ids, refresh, term]);

  const select = useCallback(() => {
    if (!plans) return;
    if (ids.length === plans.length) return setIds([]);
    setIds(plans.map((plan) => plan.id));
  }, [plans, ids.length]);

  return (
    <>
      <DrawerHeader name={ids.length > 0 ? `${ids.length} selected` : "Plans"}
        ids={ids}
        unSelect={() => setIds([])}
      >
        <ListMenu
          onClear={clear}
          onCopy={copy}
          onDelete={remove}
          onEdit={edit}
          ids={ids}
          onSelect={select}
        />
      </DrawerHeader>
      <Page onAdd={onAdd} term={term} search={search}>
        {plans?.length === 0 ? (
          <List.Item
            title="No plans yet"
            description="A plan is a list of exercises for certain days."
          />
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={plans}
            renderItem={renderItem}
            keyExtractor={(set) => set.id?.toString() || ""}
          />
        )}
      </Page>
    </>
  );
}
