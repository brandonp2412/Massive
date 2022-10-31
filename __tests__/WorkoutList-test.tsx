import {render, screen} from '@testing-library/react-native'
import React from 'react'
import 'react-native'
import {MockProviders} from '../mock-providers'
import WorkoutList from '../WorkoutList'

it('renders correctly', () => {
  render(
    <MockProviders>
      <WorkoutList />
    </MockProviders>,
  )
  expect(screen.getByText('Workouts')).toBeDefined()
  expect(screen.getByPlaceholderText('Search')).toBeDefined()
})
