import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ErrorFallback } from '../ErrorFallback';

describe('ErrorFallback', () => {
  afterEach(cleanup);

  it('should render the given title, subtitle and description', () => {
    render(<ErrorFallback description="Description text" subtitle="Subtitle text" title="Title text" />);
    expect(screen.getByText('Title text')).toBeTruthy();
    expect(screen.getByText('Subtitle text')).toBeTruthy();
    expect(screen.getByText('Description text')).toBeTruthy();
  });
});
