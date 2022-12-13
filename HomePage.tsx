import {createStackNavigator} from '@react-navigation/stack'
import EditSet from './EditSet'
import EditSets from './EditSets'
import {HomePageParams} from './home-page-params'
import SetList from './SetList'

const Stack = createStackNavigator<HomePageParams>()

export default function HomePage() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animationEnabled: false}}>
      <Stack.Screen name="Sets" component={SetList} />
      <Stack.Screen name="EditSet" component={EditSet} />
      <Stack.Screen name="EditSets" component={EditSets} />
    </Stack.Navigator>
  )
}
