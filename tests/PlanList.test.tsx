import React from 'react'
import 'react-native'
import {fireEvent, render, waitFor} from 'react-native-testing-library'
import {MockProviders} from '../mock-providers'
import {Plan} from '../plan'
import PlanPage from '../PlanPage'

jest.mock('../db.ts', () => ({
  setRepo: {
    createQueryBuilder: () => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(() =>
        Promise.resolve([
          {
            name: 'Bench press',
          },
          {
            name: 'Bicep curls',
          },
          {
            name: 'Rows',
          },
        ]),
      ),
    }),
  },
  planRepo: {
    find: () =>
      Promise.resolve([
        {
          days: 'Monday,Tuesday,Wednesday',
          workouts: 'Bench press,Side raises, Bicep curls',
          id: 1,
        },
        {
          days: 'Thursday,Friday,Saturday',
          workouts: 'Deadlifts,Barbell rows,Pull ups',
          id: 2,
        },
      ] as Plan[]),
  },
}))

test('renders correctly', async () => {
  const {getByText} = render(
    <MockProviders>
      <PlanPage />
    </MockProviders>,
  )
  const title = await waitFor(() => getByText('Plans'))
  expect(title).toBeDefined()
})

test('adds', async () => {
  const {getByTestId, getByText} = render(
    <MockProviders>
      <PlanPage />
    </MockProviders>,
  )
  fireEvent.press(await waitFor(() => getByTestId('add')))
  expect(await waitFor(() => getByText('Add plan'))).toBeDefined()
})
