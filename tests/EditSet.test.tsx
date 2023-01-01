import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import 'react-native'
import {fireEvent, render, waitFor} from 'react-native-testing-library'
import EditSet from '../EditSet'
import GymSet from '../gym-set'
import {HomePageParams} from '../home-page-params'
import {MockProviders} from '../mock-providers'
import SetList from '../SetList'
import Settings from '../settings'

jest.mock('../db.ts', () => ({
  getNow: () => Promise.resolve([{now: new Date().toISOString()}]),
  setRepo: {
    findOne: () => Promise.resolve({}),
    save: jest.fn(() => Promise.resolve({})),
  },
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

it('saves', async () => {
  const Stack = createStackNavigator<HomePageParams>()
  const {getByText, getAllByText, getByTestId} = render(
    <MockProviders>
      <Stack.Navigator>
        <Stack.Screen name="Sets" component={SetList} />
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
  const add = await waitFor(() => getByTestId('add'))
  fireEvent.press(add)
  const names = await waitFor(() => getAllByText('Name'))
  fireEvent.changeText(names[0], 'Bench Press')
  const reps = await waitFor(() => getAllByText('Reps'))
  fireEvent.changeText(reps[0], '10')
  const weights = await waitFor(() => getAllByText('Weight'))
  fireEvent.changeText(weights[0], '60')
  const save = getByText('Save')
  fireEvent.press(save)
  const home = await waitFor(() => getByText('Home'))
  expect(home).toBeDefined()
})
