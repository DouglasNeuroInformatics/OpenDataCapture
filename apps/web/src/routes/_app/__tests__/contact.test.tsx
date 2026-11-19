import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { localizeZodErrors } from '@opendatacapture/react-core';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/contact';

import '@/services/i18n';

vi.mock('@/config', () => ({
  config: { meta: { contactEmail: 'support@example.org' } }
}));

const renderPage = () => {
  const Component = Route.options.component!;
  return render(<Component />);
};

const submitContactForm = (reasonLabel: string, message: string) => {
  fireEvent.click(screen.getByTestId('contactReason-select-trigger'));
  fireEvent.click(screen.getByRole('option', { name: reasonLabel }));
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: message } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
};

describe('Route', () => {
  const open = vi.fn();

  beforeEach(() => {
    i18n.changeLanguage('en');
    open.mockReset();
    vi.stubGlobal('open', open);
  });

  // The app installs its localized validation messages at boot, which a rendered route alone skips.
  beforeAll(async () => {
    await localizeZodErrors({ targets: ['app'], translator: i18n });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('should show the page title', () => {
    renderPage();
    expect(screen.getByText('Contact Us')).toBeTruthy();
  });

  it('should open an email to the contact address with the reason as the subject and the message as the body', async () => {
    renderPage();
    submitContactForm('Bug Report', 'It broke & then?');
    await waitFor(() => {
      expect(open).toHaveBeenCalledWith(
        'mailto:support@example.org?subject=BUG%20REPORT&body=It%20broke%20%26%20then%3F',
        '_blank'
      );
    });
  });

  // The unselected reason raises an issue code that once fell through to zod's untranslated default.
  it('should report both an unselected reason and a blank message as required', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(screen.getAllByTestId('error-message-text').map((error) => error.textContent)).toEqual([
        'This field is required',
        'This field is required'
      ]);
    });
    expect(open).not.toHaveBeenCalled();
  });

  it('should not open an email when the message is blank, so an empty email is never drafted', async () => {
    renderPage();
    fireEvent.click(screen.getByTestId('contactReason-select-trigger'));
    fireEvent.click(screen.getByRole('option', { name: 'Feedback' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(screen.getByTestId('error-message-text')).toBeTruthy();
    });
    expect(open).not.toHaveBeenCalled();
  });
});
