import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FormField } from '../FormField';

afterEach(cleanup);

describe('FormField', () => {
  it('should associate the label with its control, so clicking the label focuses the input', () => {
    render(
      <FormField htmlFor="email" label="Email">
        <input id="email" />
      </FormField>
    );
    expect(screen.getByLabelText('Email').id).toBe('email');
  });

  it('should show the description only when one is given', () => {
    const { rerender } = render(
      <FormField description="We never share it" htmlFor="email" label="Email">
        <input id="email" />
      </FormField>
    );
    expect(screen.getByText('We never share it')).toBeTruthy();
    rerender(
      <FormField htmlFor="email" label="Email">
        <input id="email" />
      </FormField>
    );
    expect(screen.queryByText('We never share it')).toBeNull();
  });

  it('should key the validation message on the control id, so a test can find the error for one field', () => {
    render(
      <FormField error="Required" htmlFor="email" label="Email">
        <input id="email" />
      </FormField>
    );
    expect(screen.getByTestId('email-error').textContent).toBe('Required');
  });

  it('should render no validation message while the field is valid', () => {
    render(
      <FormField htmlFor="email" label="Email">
        <input id="email" />
      </FormField>
    );
    expect(screen.queryByTestId('email-error')).toBeNull();
  });
});
