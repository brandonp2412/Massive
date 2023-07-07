import React from 'react'
import 'react-native'
import { render, waitFor } from '@testing-library/react-native'
import { Repository } from 'typeorm'
import GymSet from '../gym-set'
import HomePage from '../HomePage'
import { MockProviders } from '../mock-providers'
import Settings from '../settings'

jest.mock('../db.ts', () => ({
  setRepo: { find: () => Promise.resolve([]) } as Repository<GymSet>,
  settingsRepo: {
    findOne: () => Promise.resolve({} as Settings),
  },
}))

test('renders correctly', async () => {
  const { getByText } = render(
    <MockProviders>
      <HomePage />
    </MockProviders>,
  )
  const title = await waitFor(() => getByText('Home'))
  expect(title).toBeDefined()
})
