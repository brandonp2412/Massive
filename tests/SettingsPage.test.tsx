import React from 'react'
import 'react-native'
import {render, waitFor} from 'react-native-testing-library'
import {Repository} from 'typeorm'
import GymSet from '../gym-set'
import {MockProviders} from '../mock-providers'
import Settings from '../settings'
import SettingsPage from '../SettingsPage'

jest.mock('../db.ts', () => ({
  setRepo: {find: () => Promise.resolve([])} as Repository<GymSet>,
  settingsRepo: {
    findOne: () => Promise.resolve({} as Settings),
  },
}))

it('renders correctly', async () => {
  const {getByText, getAllByText} = render(
    <MockProviders>
      <SettingsPage />
    </MockProviders>,
  )
  const title = await waitFor(() => getByText('Settings'))
  expect(title).toBeDefined()
  expect(getByText(/timers/i)).toBeDefined()
  expect(getByText(/vibrate/i)).toBeDefined()
  expect(getByText(/notifications/i)).toBeDefined()
  expect(getByText(/images/i)).toBeDefined()
  expect(getAllByText(/theme/i).length).toBeGreaterThan(0)
})
