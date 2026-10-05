import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { LoadingFallback } from '../LoadingFallback';

describe('LoadingFallback', () => {
  afterEach(cleanup);

  it('should render a spinner, so a suspended route shows that it is loading', () => {
    const { container } = render(<LoadingFallback />);
    expect(container.querySelector('.animate-spinner')).toBeTruthy();
  });

  it('should grow to fill its parent, so the spinner sits in the middle of the page', () => {
    const { container } = render(<LoadingFallback />);
    expect([...(container.firstElementChild?.classList ?? [])]).toEqual(
      expect.arrayContaining(['grow', 'items-center', 'justify-center'])
    );
  });
});
