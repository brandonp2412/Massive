import { createStackNavigator } from "@react-navigation/stack";
import EditSet from "./EditSet";
import SetList from "./SetList";

export type WeightPageParams = {
  Weights: {};
  EditWeight: {
    weight: any;
  };
};

const Stack = createStackNavigator<WeightPageParams>();

export default function WeightPage() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animationEnabled: false }}
    >
      <Stack.Screen name="Weights" component={SetList} />
      <Stack.Screen name="EditWeight" component={EditSet} />
    </Stack.Navigator>
  );
}
