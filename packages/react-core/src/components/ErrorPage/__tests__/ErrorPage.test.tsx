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

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should log the error and show a generic heading for a plain error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<ErrorPage error={new Error('boom')} />);
    expect(screen.getByText('Unknown Error')).toBeTruthy();
    expect(errorSpy).toHaveBeenCalledWith(new Error('boom'));
  });

  it('should show the status code and reason phrase for an axios error carrying a status', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const error = new AxiosError('Request failed');
    error.status = 404;
    render(<ErrorPage error={error} />);
    expect(screen.getByText('404 - Not Found')).toBeTruthy();
  });

  it('should download the error report when the download button is clicked', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    render(<ErrorPage error={new Error('boom')} />);
    fireEvent.click(screen.getByText('Download Error Report'));
    await waitFor(() => {
      expect(createObjectURLSpy).toHaveBeenCalled();
    });
  });

  it('should write the same report the download offers to the clipboard, so it need not be downloaded to be shared', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    render(<ErrorPage error={new Error('boom')} />);
    fireEvent.click(screen.getByText('Copy Error Report'));
    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeTruthy();
    });
    expect(JSON.parse(writeText.mock.calls[0]![0] as string)).toMatchObject({ message: 'boom' });
  });

  it('should report a failure to copy rather than appearing to have copied, since an insecure context has no clipboard', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined });
    render(<ErrorPage error={new Error('boom')} />);
    fireEvent.click(screen.getByText('Copy Error Report'));
    await waitFor(() => {
      expect(screen.getByText('Copy Failed')).toBeTruthy();
    });
  });

  it('should offer the copy again once the mouse leaves, so a failed copy can be retried', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined });
    render(<ErrorPage error={new Error('boom')} />);
    fireEvent.click(screen.getByText('Copy Error Report'));
    await waitFor(() => {
      expect(screen.getByText('Copy Failed')).toBeTruthy();
    });
    fireEvent.mouseLeave(screen.getByTestId('copy-error-report'));
    expect(screen.getByText('Copy Error Report')).toBeTruthy();
  });

  it('should reload the page when the reload button is clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => undefined);
    render(<ErrorPage error={new Error('boom')} />);
    fireEvent.click(screen.getByText('Reload Page'));
    expect(assignSpy).toHaveBeenCalledWith(window.location.origin);
  });
});
