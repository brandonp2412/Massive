import {render, screen} from '@testing-library/react-native';
import React from 'react';
import 'react-native';
import {MockProviders} from '../mock-providers';
import Set from '../set';
import WorkoutItem from '../WorkoutItem';

const set: Set = {
  name: 'Bench press',
  reps: 6,
  weight: 20,
  seconds: 40,
  minutes: 3,
  sets: 5,
};

it('renders correctly', () => {
  const onRemove = jest.fn();
  render(
    <MockProviders>
      <WorkoutItem item={set} onRemove={onRemove} />
    </MockProviders>,
  );
  expect(screen.getByText(set.name)).toBeDefined();
  const sets = RegExp(set.sets?.toString() || '');
  expect(screen.getByText(sets)).toBeDefined();
});
