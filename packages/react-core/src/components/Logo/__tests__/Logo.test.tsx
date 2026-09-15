import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Logo } from '../Logo';

describe('Logo', () => {
  afterEach(cleanup);

  it.each(['auto', 'dark', 'light'] as const)('should render for the %s variant', (variant) => {
    const { container } = render(<Logo variant={variant} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
