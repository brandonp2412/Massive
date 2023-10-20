import { createStackNavigator } from "@react-navigation/stack";
import EditWeight from "./EditWeight";
import ViewWeightGraph from "./ViewWeightGraph";
import Weight from "./weight";
import WeightList from "./WeightList";

export type WeightPageParams = {
  Weights: {};
  EditWeight: {
    weight: Weight;
  };
  ViewWeightGraph: {};
};

const Stack = createStackNavigator<WeightPageParams>();

export default function WeightPage() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animationEnabled: false }}
    >
      <Stack.Screen name="Weights" component={WeightList} />
      <Stack.Screen name="EditWeight" component={EditWeight} />
      <Stack.Screen name="ViewWeightGraph" component={ViewWeightGraph} />
    </Stack.Navigator>
  );
}
