import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { expect } from 'vitest';

import { ArrowToggle } from './ArrowToggle';

describe('ArrowToggle', () => {
  it('should rotate correctly from up to down', () => {
    render(<ArrowToggle position="up" rotation={180} />);

    const btn = screen.getByRole('button');
    const svg = screen.getByTestId('arrow-up-icon');

    expect(svg).toHaveStyle({ transform: 'rotate(0deg)' });
    fireEvent.click(btn);
    expect(svg).toHaveStyle({ transform: 'rotate(180deg)' });
  });
});
