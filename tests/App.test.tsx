import { render, waitFor } from '@testing-library/react-native'
import React from 'react'
import 'react-native'
import App from '../App'
import Settings from '../settings'

jest.mock('../db.ts', () => ({
  settingsRepo: {
    findOne: () => Promise.resolve({} as Settings),
  },
}))

jest.mock('../data-source.ts', () => ({
  AppDataSource: {
    isInitialized: false,
    initialize: jest.fn(),
  },
}))

test('renders correctly', async () => {
  const { getAllByText } = render(<App />)
  const title = await waitFor(() => getAllByText('Home'))
  expect(title.length).toBeGreaterThan(0)
})
