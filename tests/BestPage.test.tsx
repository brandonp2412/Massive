import React from 'react'
import 'react-native'
import {render, waitFor} from 'react-native-testing-library'
import {Repository} from 'typeorm'
import BestPage from '../BestPage'
import GymSet from '../gym-set'
import {MockProviders} from '../mock-providers'
import Settings from '../settings'

jest.mock('../db.ts', () => ({
  setRepo: {find: () => Promise.resolve([])} as Repository<GymSet>,
  settingsRepo: {
    findOne: () => Promise.resolve({} as Settings),
  },
}))

it('renders correctly', async () => {
  const {getByText} = render(
    <MockProviders>
      <BestPage />
    </MockProviders>,
  )
  const title = await waitFor(() => getByText('Best'))
  expect(title).toBeDefined()
})
