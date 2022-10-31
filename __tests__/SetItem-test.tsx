import {render, screen} from '@testing-library/react-native'
import React from 'react'
import 'react-native'
import {MockProviders} from '../mock-providers'
import Set from '../set'
import SetItem from '../SetItem'

const set: Set = {
  name: 'Bench press',
  reps: 6,
  weight: 20,
}

it('renders correctly', () => {
  const onRemove = jest.fn()
  render(
    <MockProviders>
      <SetItem item={set} onRemove={onRemove} />
    </MockProviders>,
  )
  expect(screen.getByText(set.name)).toBeDefined()
  const reps = RegExp(set.reps.toString())
  expect(screen.getByText(reps)).toBeDefined()
  const weight = RegExp(set.weight.toString())
  expect(screen.getByText(weight)).toBeDefined()
})
