import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ErrorBox } from '../ErrorBox';

describe('ErrorBox', () => {
  afterEach(cleanup);

  it('should render the title and every issue', () => {
    render(<ErrorBox issues={['Issue one', 'Issue two']} title="Validation failed" />);
    expect(screen.getByText('Validation failed')).toBeTruthy();
    expect(screen.getAllByTestId('error-box-issue')).toHaveLength(2);
  });

  it('should render the title alone when no issues are given', () => {
    render(<ErrorBox title="Validation failed" />);
    expect(screen.getByText('Validation failed')).toBeTruthy();
    expect(screen.queryByTestId('error-box-issue')).toBeNull();
  });
});
