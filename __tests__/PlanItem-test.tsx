import {render, screen} from '@testing-library/react-native'
import React from 'react'
import 'react-native'
import {MockProviders} from '../mock-providers'
import {Plan} from '../plan'
import PlanItem from '../PlanItem'

const plan: Plan = {
  days: 'Monday,Tuesday,Wednesday',
  workouts: 'Bench press,Bicep curls,Overhead press',
}

it('renders correctly', () => {
  const onRemove = jest.fn()
  render(
    <MockProviders>
      <PlanItem item={plan} onRemove={onRemove} />
    </MockProviders>,
  )
  expect(screen.getByText(/Monday/i)).toBeDefined()
  expect(screen.getByText(/Tuesday/i)).toBeDefined()
  expect(screen.getByText(/Wednesday/i)).toBeDefined()
  expect(screen.getByText(/Bench press/i)).toBeDefined()
  expect(screen.getByText(/Bicep curls/i)).toBeDefined()
  expect(screen.getByText(/Overhead press/i)).toBeDefined()
})
