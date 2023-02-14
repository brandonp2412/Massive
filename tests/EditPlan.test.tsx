import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import 'react-native'
import {render, waitFor} from 'react-native-testing-library'
import EditPlan from '../EditPlan'
import {MockProviders} from '../mock-providers'
import {Plan} from '../plan'
import {PlanPageParams} from '../plan-page-params'

jest.mock('../db.ts', () => ({
  setRepo: {
    createQueryBuilder: () => ({
      select: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(() =>
        Promise.resolve([
          {name: 'Bench press'},
          {name: 'Bicep curls'},
          {name: 'Rows'},
        ]),
      ),
    }),
  },
}))

test('renders correctly', async () => {
  const Stack = createStackNavigator<PlanPageParams>()
  const {getByText, getAllByText} = render(
    <MockProviders>
      <Stack.Navigator>
        <Stack.Screen
          initialParams={{
            plan: {
              workouts: 'Bench,Rows,Curls',
              days: 'Monday,Tuesday,Thursday',
              id: 1,
            } as Plan,
          }}
          name="EditPlan"
          component={EditPlan}
        />
      </Stack.Navigator>
    </MockProviders>,
  )
  const title = await waitFor(() => getByText(/Edit plan/i))
  expect(title).toBeDefined()
  expect(getAllByText('Days').length).toBeGreaterThan(0)
  expect(getAllByText('Monday').length).toBeGreaterThan(0)
  expect(getAllByText('Workouts').length).toBeGreaterThan(0)
  expect(getAllByText('Bench press').length).toBeGreaterThan(0)
  expect(getAllByText('Save').length).toBeGreaterThan(0)
})
