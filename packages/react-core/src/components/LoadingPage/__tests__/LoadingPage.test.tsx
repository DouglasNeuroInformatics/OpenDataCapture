import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { LoadingPage } from '../LoadingPage';

describe('LoadingPage', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
  });

  afterEach(cleanup);

  it('should render the given title and subtitle', () => {
    render(<LoadingPage subtitle="Please wait" title="Loading" />);
    expect(screen.getByText('Loading')).toBeTruthy();
    expect(screen.getByText('Please wait')).toBeTruthy();
  });
});
