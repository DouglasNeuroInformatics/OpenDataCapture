import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { ErrorPage } from '../ErrorPage';

describe('ErrorPage', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should log the error and show a generic heading for a plain error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<ErrorPage error={new Error('boom')} />);
    expect(screen.getByText('Unknown Error')).toBeTruthy();
    expect(errorSpy).toHaveBeenCalledWith(new Error('boom'));
    errorSpy.mockRestore();
  });

  it('should show the status code and reason phrase for an axios error carrying a status', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const error = new AxiosError('Request failed');
    error.status = 404;
    render(<ErrorPage error={error} />);
    expect(screen.getByText('404 - Not Found')).toBeTruthy();
  });

  it('should download the error report when the error report button is clicked', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    render(<ErrorPage error={new Error('boom')} />);
    fireEvent.click(screen.getByText('Error Report'));
    await waitFor(() => {
      expect(createObjectURLSpy).toHaveBeenCalled();
    });
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('should reload the page when the reload button is clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => undefined);
    render(<ErrorPage error={new Error('boom')} />);
    fireEvent.click(screen.getByText('Reload Page'));
    expect(assignSpy).toHaveBeenCalledWith(window.location.origin);
    assignSpy.mockRestore();
  });
});
