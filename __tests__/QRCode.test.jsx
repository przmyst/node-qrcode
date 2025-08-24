import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import QRCode from '../index.js';

test('renders an image with a data URL', async () => {
  render(<QRCode value="Hello" />);
  const img = await screen.findByRole('img');
  expect(img).toHaveAttribute('src');
});
