import React from 'react'
import 'react-native'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import GraphsPage from '../GraphsPage'
import { MockProviders } from '../mock-providers'
import Settings from '../settings'

jest.mock('../db.ts', () => ({
  setRepo: {
    createQueryBuilder: () => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
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
        ])
      ),
    }),
  },
  settingsRepo: {
    findOne: () => Promise.resolve({ images: true } as Settings),
  },
}))

test('renders correctly', async () => {
  const { getByText } = render(
    <MockProviders>
      <GraphsPage />
    </MockProviders>,
  )
  const title = await waitFor(() => getByText('Graphs'))
  expect(title).toBeDefined()
})

test('searches', async () => {
  const { getByDisplayValue, getByPlaceholderText } = render(
    <MockProviders>
      <GraphsPage />
    </MockProviders>,
  )
  const search = await waitFor(() => getByPlaceholderText('Search'))
  expect(search).toBeDefined()
  fireEvent.changeText(search, 'SearchValue')
  const value = await waitFor(() => getByDisplayValue('SearchValue'))
  expect(value).toBeDefined()
})