import React from 'react';

import { render, screen } from '@testing-library/react';

import { Button } from './Button';

describe('Button', () => {
  it('renders a button with the correct label', async () => {
    render(<Button label="My Button" />);
    await screen.findByRole('button');
    expect(screen.getByRole('button')).toHaveTextContent('My Button');
  });
});
