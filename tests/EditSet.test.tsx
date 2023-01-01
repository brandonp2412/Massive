import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import 'react-native'
import {render, waitFor} from 'react-native-testing-library'
import EditSet from '../EditSet'
import GymSet from '../gym-set'
import {HomePageParams} from '../home-page-params'
import {MockProviders} from '../mock-providers'
import Settings from '../settings'

jest.mock('../db.ts', () => ({
  setRepo: {findOne: () => Promise.resolve({})},
  settingsRepo: {
    findOne: () =>
      Promise.resolve({
        showUnit: true,
        showDate: true,
        images: true,
      } as Settings),
  },
}))

it('renders correctly', async () => {
  const Stack = createStackNavigator<HomePageParams>()
  const {getByText, getAllByText} = render(
    <MockProviders>
      <Stack.Navigator>
        <Stack.Screen
          initialParams={{
            set: {
              created: '2023-01-01T01:45:13.238Z',
              id: 1,
            } as GymSet,
          }}
          name="EditSet"
          component={EditSet}
        />
      </Stack.Navigator>
    </MockProviders>,
  )
  const title = await waitFor(() => getByText('Edit set'))
  expect(title).toBeDefined()
  expect(getAllByText('Name').length).toBeGreaterThan(0)
  expect(getAllByText('Reps').length).toBeGreaterThan(0)
  expect(getAllByText('Weight').length).toBeGreaterThan(0)
  expect(getAllByText('Unit').length).toBeGreaterThan(0)
  expect(getAllByText('Created').length).toBeGreaterThan(0)
  expect(getAllByText('Image').length).toBeGreaterThan(0)
})
