import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  afterEach(cleanup);

  it("should render the error's name and message", () => {
    render(<ErrorMessage error={new TypeError('boom')} />);
    expect(screen.getByText('TypeError:')).toBeTruthy();
    expect(screen.getByText('boom')).toBeTruthy();
  });
});
