import { createStackNavigator } from "@react-navigation/stack";
import GraphsList from "./GraphsList";
import GymSet from "./gym-set";
import ViewGraph from "./ViewGraph";

const Stack = createStackNavigator<GraphsPageParams>();
export type GraphsPageParams = {
  GraphsList: {};
  ViewGraph: {
    best: GymSet;
  };
};

export default function GraphsPage() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animationEnabled: false }}
    >
      <Stack.Screen name="GraphsList" component={GraphsList} />
      <Stack.Screen name="ViewGraph" component={ViewGraph} />
    </Stack.Navigator>
  );
}
