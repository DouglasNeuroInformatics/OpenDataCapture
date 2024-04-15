import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CopyButton } from './CopyButton';

describe('CopyButton', () => {
  it('should render', () => {
    render(<CopyButton text="" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
