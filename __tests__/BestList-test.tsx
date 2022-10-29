import {render, screen} from '@testing-library/react-native';
import React from 'react';
import 'react-native';
import BestList from '../BestList';
import {MockProviders} from '../mock-providers';

it('renders correctly', () => {
  render(
    <MockProviders>
      <BestList />
    </MockProviders>,
  );
  expect(screen.getByText('Best')).toBeDefined();
  expect(screen.getByPlaceholderText('Search')).toBeDefined();
});
