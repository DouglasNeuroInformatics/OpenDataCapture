import React from 'react';

import { render } from '@testing-library/react';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('should render nothing when no error is provided', () => {
    const { container } = render(<ErrorMessage />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the error message when error prop is provided', () => {
    const error = {
      type: 'Error',
      message: 'Something went wrong!'
    };
    const { getByText } = render(<ErrorMessage error={error} />);
    expect(getByText('Error: Something went wrong!')).toBeInTheDocument();
  });
});
