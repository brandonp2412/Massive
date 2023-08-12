import { createStackNavigator } from "@react-navigation/stack";
import EditPlan from "./EditPlan";
import EditSet from "./EditSet";
import { PlanPageParams } from "./plan-page-params";
import PlanList from "./PlanList";
import StartPlan from "./StartPlan";

const Stack = createStackNavigator<PlanPageParams>();

export default function PlanPage() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animationEnabled: false }}
    >
      <Stack.Screen name="PlanList" component={PlanList} />
      <Stack.Screen name="EditPlan" component={EditPlan} />
      <Stack.Screen name="StartPlan" component={StartPlan} />
      <Stack.Screen name="EditSet" component={EditSet} />
    </Stack.Navigator>
  );
}
