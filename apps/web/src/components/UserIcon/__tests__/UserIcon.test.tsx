import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { UserIcon } from '../UserIcon';

describe('UserIcon', () => {
  afterEach(cleanup);

  it('should be hidden from assistive technology, since it only decorates the username beside it', () => {
    render(<UserIcon />);
    expect(screen.getByTestId('user-icon').getAttribute('aria-hidden')).toBe('true');
  });

  it('should let a caller override its default attributes, such as its size', () => {
    render(<UserIcon className="h-4 w-4" />);
    expect(screen.getByTestId('user-icon').getAttribute('class')).toBe('h-4 w-4');
  });
});
