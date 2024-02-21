import { createStackNavigator } from "@react-navigation/stack";
import AppDrawer from "./AppDrawer";
import EditExercise from "./EditExercise";
import EditExercises from "./EditExercises";
import EditPlan from "./EditPlan";
import EditSet from "./EditSet";
import EditSets from "./EditSets";
import EditWeight from "./EditWeight";
import GymSet from "./gym-set";
import { Plan } from "./plan";
import StartPlan from "./StartPlan";
import ViewGraph from "./ViewGraph";
import ViewSetList from "./ViewSetList";
import ViewWeightGraph from "./ViewWeightGraph";
import Weight from "./weight";
import { View, Text, StyleSheet } from "react-native";

export type StackParams = {
  Drawer: {};
  EditSet: {
    set: Partial<GymSet>;
  };
  EditSets: {
    ids: number[];
  };
  EditPlan: {
    plan: Partial<Plan>;
  };
  StartPlan: {
    plan: Plan;
    first: Partial<GymSet>;
  };
  ViewGraph: {
    name: string;
  };
  EditWeight: {
    weight: Partial<Weight>;
  };
  ViewWeightGraph: {};
  EditExercise: {
    gymSet: Partial<GymSet>;
  };
  EditExercises: {
    names: string[];
  };
  ViewSetList: {
    name: string;
  };
};

const Stack = createStackNavigator<StackParams>();

export default function AppStack({ startup }: { startup: string }) {
  return (
    <>
      {__DEV__ && (
        <View style={styles.debugBanner}>
          <Text style={styles.debugText}>DEBUG</Text>
        </View>
      )}
      <Stack.Navigator
        screenOptions={{ headerShown: false, animationEnabled: false }}
      >
        <Stack.Screen
          name="Drawer"
          component={AppDrawer}
          initialParams={{ startup }}
        />
        <Stack.Screen name="EditSet" component={EditSet} />
        <Stack.Screen name="EditSets" component={EditSets} />
        <Stack.Screen name="EditPlan" component={EditPlan} />
        <Stack.Screen name="StartPlan" component={StartPlan} />
        <Stack.Screen name="ViewGraph" component={ViewGraph} />
        <Stack.Screen name="EditWeight" component={EditWeight} />
        <Stack.Screen name="ViewWeightGraph" component={ViewWeightGraph} />
        <Stack.Screen name="EditExercise" component={EditExercise} />
        <Stack.Screen name="EditExercises" component={EditExercises} />
        <Stack.Screen name="ViewSetList" component={ViewSetList} />
      </Stack.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugBanner: {
    position: 'absolute',
    top: 20,
    right: 100,
    backgroundColor: 'red',
    zIndex: 1000,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    padding: 5,
    fontSize: 10,
  },
});
