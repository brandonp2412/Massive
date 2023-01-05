import React from 'react'
import 'react-native'
import {fireEvent, render, waitFor} from 'react-native-testing-library'
import BestPage from '../BestPage'
import {MockProviders} from '../mock-providers'
import Settings from '../settings'

jest.mock('../db.ts', () => ({
  setRepo: {
    createQueryBuilder: () => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(() =>
        Promise.resolve([
          {
            name: 'Bench press',
            value: 16,
            created: '2023-01-05T03:58:02.565Z',
            weight: 18,
          },
          {
            name: 'Bench press',
            value: 48,
            created: '2022-01-05T03:58:02.565Z',
            weight: 48,
          },
          {
            name: 'Bench press',
            value: 30,
            created: '2021-01-05T03:58:02.565Z',
            weight: 28,
          },
        ]),
      ),
      getMany: jest.fn(() =>
        Promise.resolve([
          {
            name: 'Bench press',
            weight: 60,
            reps: 8,
            image: 'https://picsum.photos/id/10/1000/600',
          },
          {
            name: 'Bicep curls',
            weight: 20,
            reps: 10,
            image: 'https://picsum.photos/id/0/1000/600',
          },
          {
            name: 'Rows',
            weight: 100,
            reps: 10,
            image: 'https://picsum.photos/id/1/1000/600',
          },
        ]),
      ),
    }),
  },
  settingsRepo: {
    findOne: () => Promise.resolve({images: true} as Settings),
  },
}))

test('renders correctly', async () => {
  const {getAllByText, getByText} = render(
    <MockProviders>
      <BestPage />
    </MockProviders>,
  )
  const benches = await waitFor(() => getAllByText('Bench press'))
  expect(benches).toBeDefined()
  fireEvent.press(benches[0])
  const bench = await waitFor(() => getByText('Metric'))
  expect(bench).toBeDefined()
  expect(getByText('Period')).toBeDefined()
})

test('volume', async () => {
  const {getAllByText, getByText} = render(
    <MockProviders>
      <BestPage />
    </MockProviders>,
  )
  const benches = await waitFor(() => getAllByText('Bench press'))
  expect(benches).toBeDefined()
  fireEvent.press(benches[0])
  const bestWeight = await waitFor(() => getByText('Best weight'))
  fireEvent.press(bestWeight)
  const volume = await waitFor(() => getByText('Volume'))
  fireEvent.press(volume)
  expect(await waitFor(() => getByText('Volume'))).toBeDefined()
})

test('one rep max', async () => {
  const {getAllByText, getByText} = render(
    <MockProviders>
      <BestPage />
    </MockProviders>,
  )
  const benches = await waitFor(() => getAllByText(/Bench press/i))
  expect(benches).toBeDefined()
  fireEvent.press(benches[0])
  const bestWeight = await waitFor(() => getByText(/Best weight/i))
  fireEvent.press(bestWeight)
  const volume = await waitFor(() => getByText(/One rep max/i))
  fireEvent.press(volume)
  expect(await waitFor(() => getByText(/One rep max/i))).toBeDefined()
})

test('this week', async () => {
  const {getAllByText, getByText} = render(
    <MockProviders>
      <BestPage />
    </MockProviders>,
  )
  const benches = await waitFor(() => getAllByText(/Bench press/i))
  expect(benches).toBeDefined()
  fireEvent.press(benches[0])
  fireEvent.press(await waitFor(() => getByText(/This month/i)))
  fireEvent.press(await waitFor(() => getByText(/This week/i)))
  expect(await waitFor(() => getByText(/This week/i))).toBeDefined()
})

test('this year', async () => {
  const {getAllByText, getByText} = render(
    <MockProviders>
      <BestPage />
    </MockProviders>,
  )
  const benches = await waitFor(() => getAllByText(/Bench press/i))
  expect(benches).toBeDefined()
  fireEvent.press(benches[0])
  fireEvent.press(await waitFor(() => getByText(/This month/i)))
  fireEvent.press(await waitFor(() => getByText(/This year/i)))
  expect(await waitFor(() => getByText(/This year/i))).toBeDefined()
})
