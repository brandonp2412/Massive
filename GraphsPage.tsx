import { createStackNavigator } from "@react-navigation/stack";
import GraphsList from "./GraphsList";

const Stack = createStackNavigator<GraphsPageParams>();
export type GraphsPageParams = {
  GraphsList: {};
  ViewGraph: {
    name: string;
  };
};

export default function GraphsPage() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animationEnabled: false }}
    >
      <Stack.Screen name="GraphsList" component={GraphsList} />
    </Stack.Navigator>
  );
}
