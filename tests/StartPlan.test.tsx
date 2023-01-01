import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import 'react-native'
import {fireEvent, render, waitFor} from 'react-native-testing-library'
import GymSet from '../gym-set'
import {MockProviders} from '../mock-providers'
import {Plan} from '../plan'
import {PlanPageParams} from '../plan-page-params'
import Settings from '../settings'
import StartPlan from '../StartPlan'

jest.mock('../best.service.ts', () => ({
  getBestSet: () => Promise.resolve({}),
}))

jest.mock('../db.ts', () => ({
  getNow: () => Promise.resolve([{now: new Date().toISOString()}]),
  setRepo: {
    findOne: () => Promise.resolve({}),
    save: () => Promise.resolve(),
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

jest.mock('../data-source.ts', () => ({
  AppDataSource: {
    manager: {
      query: jest.fn(() =>
        Promise.resolve([
          {name: 'Bench', total: 0},
          {name: 'Rows', total: 0},
          {name: 'Curls', total: 0},
        ]),
      ),
    },
  },
}))

it('renders correctly', async () => {
  const Stack = createStackNavigator<PlanPageParams>()
  const {getByText, getAllByText} = render(
    <MockProviders>
      <Stack.Navigator>
        <Stack.Screen
          initialParams={{
            first: {reps: 0, weight: 0} as GymSet,
            plan: {
              workouts: 'Bench,Rows,Curls',
              days: 'Monday,Tuesday,Thursday',
            } as Plan,
          }}
          name="StartPlan"
          component={StartPlan}
        />
      </Stack.Navigator>
    </MockProviders>,
  )
  const title = await waitFor(() => getByText(/Monday/i))
  expect(title).toBeDefined()
  expect(getAllByText('Reps').length).toBeGreaterThan(0)
  expect(getAllByText('Weight').length).toBeGreaterThan(0)
  expect(getAllByText('Unit').length).toBeGreaterThan(0)
  expect(getAllByText('Bench').length).toBeGreaterThan(0)
  expect(getAllByText('Rows').length).toBeGreaterThan(0)
  expect(getAllByText('Curls').length).toBeGreaterThan(0)
  expect(getAllByText('Save').length).toBeGreaterThan(0)
})

it('saves', async () => {
  const Stack = createStackNavigator<PlanPageParams>()
  const {getByText} = render(
    <MockProviders>
      <Stack.Navigator>
        <Stack.Screen
          initialParams={{
            first: {reps: 0, weight: 0} as GymSet,
            plan: {
              workouts: 'Bench,Rows,Curls',
              days: 'Monday,Tuesday,Thursday',
            } as Plan,
          }}
          name="StartPlan"
          component={StartPlan}
        />
      </Stack.Navigator>
    </MockProviders>,
  )
  const save = await waitFor(() => getByText('Save'))
  expect(save).toBeDefined()
  fireEvent.press(save)
  const save2 = await waitFor(() => getByText('Save'))
  expect(save2).toBeDefined()
})
