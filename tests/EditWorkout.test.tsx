import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import 'react-native'
import {render, waitFor} from 'react-native-testing-library'
import EditWorkout from '../EditWorkout'
import GymSet from '../gym-set'
import {MockProviders} from '../mock-providers'
import Settings from '../settings'
import {WorkoutsPageParams} from '../WorkoutsPage'

jest.mock('../db.ts', () => ({
  settingsRepo: {
    findOne: () =>
      Promise.resolve({
        showSets: true,
        alarm: true,
      } as Settings),
  },
}))

it('renders correctly', async () => {
  const Stack = createStackNavigator<WorkoutsPageParams>()
  const {getByText, getAllByText} = render(
    <MockProviders>
      <Stack.Navigator>
        <Stack.Screen
          initialParams={{
            value: {} as GymSet,
          }}
          name="EditWorkout"
          component={EditWorkout}
        />
      </Stack.Navigator>
    </MockProviders>,
  )
  const title = await waitFor(() => getByText(/Edit workout/i))
  expect(title).toBeDefined()
  expect(getAllByText(/Name/i).length).toBeGreaterThan(0)
  expect(getAllByText(/Sets/i).length).toBeGreaterThan(0)
  expect(getAllByText(/Minutes/i).length).toBeGreaterThan(0)
  expect(getAllByText(/Seconds/i).length).toBeGreaterThan(0)
  expect(getAllByText(/Save/i).length).toBeGreaterThan(0)
})
