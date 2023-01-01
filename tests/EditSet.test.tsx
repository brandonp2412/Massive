import React from 'react'
import 'react-native'
import {render, waitFor} from 'react-native-testing-library'
import HomePage from '../HomePage'
import {MockProviders} from '../mock-providers'
import Settings from '../settings'

jest.mock('../db.ts', () => ({
  setRepo: {findOne: () => Promise.resolve({})},
  settingsRepo: {
    findOne: () => Promise.resolve({} as Settings),
  },
}))

it('renders correctly', async () => {
  const {getByText} = render(
    <MockProviders>
      <HomePage />
    </MockProviders>,
  )
  const title = await waitFor(() => getByText('Home'))
  expect(title).toBeDefined()
})
