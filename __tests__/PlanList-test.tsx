import {render, screen} from '@testing-library/react-native';
import React from 'react';
import 'react-native';
import {MockProviders} from '../mock-providers';
import PlanList from '../PlanList';

it('renders correctly', () => {
  render(
    <MockProviders>
      <PlanList />
    </MockProviders>,
  );
  expect(screen.getByText('Plans')).toBeDefined();
  expect(screen.getByPlaceholderText('Search')).toBeDefined();
});
