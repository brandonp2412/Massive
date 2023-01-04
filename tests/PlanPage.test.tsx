import React from 'react'
import 'react-native'
import {render, waitFor} from 'react-native-testing-library'
import {Repository} from 'typeorm'
import GymSet from '../gym-set'
import {MockProviders} from '../mock-providers'
import PlanPage from '../PlanPage'
import Settings from '../settings'

jest.mock('../db.ts', () => ({
  setRepo: {find: () => Promise.resolve([])} as Repository<GymSet>,
  settingsRepo: {
    findOne: () => Promise.resolve({} as Settings),
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
