import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import 'react-native'
import {fireEvent, render, waitFor} from 'react-native-testing-library'
import EditSets from '../EditSets'
import {HomePageParams} from '../home-page-params'
import {MockProviders} from '../mock-providers'

const mockGoBack = jest.fn()

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}))

jest.mock('../db.ts', () => ({
  getNow: () => Promise.resolve(new Date().toISOString()),
  setRepo: {
    find: () =>
      Promise.resolve([
        {name: 'Bench press', reps: 8, weight: 60, id: 1},
        {name: 'Bench press', reps: 6, weight: 70, id: 2},
        {name: 'Bench press', reps: 4, weight: 85, id: 3},
      ]),
    update: jest.fn(() => Promise.resolve()),
  },
  settingsRepo: {
    findOne: () =>
      Promise.resolve({
        showUnit: true,
        showDate: true,
        images: true,
      }),
  },
}))

test('renders correctly', async () => {
  const Stack = createStackNavigator<HomePageParams>()
  const {getByText, getAllByText} = render(
    <MockProviders>
      <Stack.Navigator>
        <Stack.Screen
          initialParams={{ids: [1, 2, 3]}}
          name="EditSets"
          component={EditSets}
        />
      </Stack.Navigator>
    </MockProviders>,
  )
  const title = await waitFor(() => getByText('Edit 3 sets'))
  expect(title).toBeDefined()
  expect(getAllByText(/Names/i).length).toBeGreaterThan(0)
  expect(getAllByText(/Reps/i).length).toBeGreaterThan(0)
  expect(getAllByText(/Weights/i).length).toBeGreaterThan(0)
  expect(getAllByText(/Units/i).length).toBeGreaterThan(0)
  expect(getAllByText(/Image/i).length).toBeGreaterThan(0)
})

test('saves', async () => {
  const Stack = createStackNavigator<HomePageParams>()
  const {getByText, getAllByText} = render(
    <MockProviders>
      <Stack.Navigator>
        <Stack.Screen
          initialParams={{ids: [1, 2, 3]}}
          name="EditSets"
          component={EditSets}
        />
      </Stack.Navigator>
    </MockProviders>,
  )
  const items = await waitFor(() => getAllByText(/Bench press/i))
  fireEvent.changeText(items[0], 'Shoulder press')
  const reps = await waitFor(() => getAllByText(/Reps/i))
  fireEvent.changeText(reps[0], '10')
  const weights = await waitFor(() => getAllByText(/Weights/i))
  fireEvent.changeText(weights[0], '60')
  const units = await waitFor(() => getAllByText(/Units/i))
  fireEvent.changeText(units[0], 'lb')
  const save = getByText('Save')
  fireEvent.press(save)
  await waitFor(() => getByText('Save'))
  expect(mockGoBack).toHaveBeenCalled()
})
