import {render, screen} from '@testing-library/react-native';
import React from 'react';
import 'react-native';
import {MockProviders} from '../mock-providers';
import SetList from '../SetList';

it('renders correctly', () => {
  render(
    <MockProviders>
      <SetList />
    </MockProviders>,
  );
  expect(screen.getByText('Home')).toBeDefined();
  expect(screen.getByPlaceholderText('Search')).toBeDefined();
});
