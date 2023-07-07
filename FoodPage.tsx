import { createStackNavigator } from '@react-navigation/stack'
import FoodList from './FoodList'
import EditFood from './EditFood'
import Food from './food'

export type FoodPageParams = {
  Food: {}
  EditFood: {
    food: Food
  }
}

const Stack = createStackNavigator<FoodPageParams>()

export default function FoodPage() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animationEnabled: false }}
    >
      <Stack.Screen name='Food' component={FoodList} />
      <Stack.Screen name='EditFood' component={EditFood} />
    </Stack.Navigator>
  )
}
