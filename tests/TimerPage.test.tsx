import React from 'react'
import 'react-native'
import {render, waitFor} from 'react-native-testing-library'
import {Repository} from 'typeorm'
import GymSet from '../gym-set'
import {MockProviders} from '../mock-providers'
import Settings from '../settings'
import TimerPage from '../TimerPage'

jest.mock('../db.ts', () => ({
  setRepo: {find: () => Promise.resolve([])} as Repository<GymSet>,
  settingsRepo: {
    findOne: () => Promise.resolve({} as Settings),
  },
}))

describe('PlanPage', () => {
  it('renders correctly', async () => {
    const {getByText} = render(
      <MockProviders>
        <TimerPage />
      </MockProviders>,
    )
    const title = await waitFor(() => getByText('Timer'))
    expect(title).toBeDefined()
  })
})
