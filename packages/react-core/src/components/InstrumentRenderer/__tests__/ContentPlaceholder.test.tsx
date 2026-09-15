import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ContentPlaceholder } from '../ContentPlaceholder';

describe('ContentPlaceholder', () => {
  afterEach(cleanup);

  it('should render the title without a message when none is given', () => {
    render(<ContentPlaceholder title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeTruthy();
  });

  it('should render the message when one is given', () => {
    render(<ContentPlaceholder message="Try again later" title="Nothing here" />);
    expect(screen.getByText('Try again later')).toBeTruthy();
  });
});
