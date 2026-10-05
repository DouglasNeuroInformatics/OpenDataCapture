import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

import { ScalarInstrumentRenderer } from '../ScalarInstrumentRenderer';

import type { NavigationBlockerProps } from '../../NavigationBlockerDialog';

/**
 * A bundle is evaluated with `new Function`, so it can close over nothing in this file. The
 * validation schema is handed to it through `globalThis`, which is the one scope both share.
 */
declare global {
  var __testValidationSchema: z.ZodTypeAny;
  var __testFileValidationSchema: z.ZodTypeAny;
  var __testRejectingSchema: z.ZodTypeAny;
}

globalThis.__testValidationSchema = z.object({ answer: z.string().min(1) });
globalThis.__testFileValidationSchema = z.any();
globalThis.__testRejectingSchema = z.never();

const FORM_BUNDLE = `(async () => ({
  __runtimeVersion: 1,
  kind: 'FORM',
  language: 'en',
  tags: ['Test'],
  internal: { edition: 1, name: 'STUB_FORM' },
  content: {
    answer: { kind: 'string', label: 'Answer', variant: 'input' }
  },
  details: {
    description: 'A form under test',
    license: 'Apache-2.0',
    title: 'Stub Form'
  },
  measures: null,
  validationSchema: globalThis.__testValidationSchema
}))()`;

const FILE_BUNDLE = `(async () => ({
  __runtimeVersion: 1,
  kind: 'FILE',
  language: 'en',
  tags: ['Test'],
  internal: { edition: 1, name: 'STUB_FILE' },
  content: {
    fileGroups: [{ basename: 'document', count: { max: 1, min: 1 }, label: 'Document', type: null }]
  },
  details: {
    description: 'A file instrument under test',
    license: 'Apache-2.0',
    title: 'Stub File'
  },
  measures: null,
  validationSchema: globalThis.__testFileValidationSchema
}))()`;

const INTERACTIVE_BUNDLE = `(async () => ({
  __runtimeVersion: 1,
  kind: 'INTERACTIVE',
  language: 'en',
  tags: ['Test'],
  internal: { edition: 1, name: 'STUB_INTERACTIVE' },
  content: {},
  details: {
    description: 'An interactive instrument under test',
    license: 'Apache-2.0',
    title: 'Stub Interactive'
  },
  measures: null
}))()`;

const REJECTING_FILE_BUNDLE = FILE_BUNDLE.replace('__testFileValidationSchema', '__testRejectingSchema');

const UNKNOWN_KIND_BUNDLE = INTERACTIVE_BUNDLE.replace("kind: 'INTERACTIVE'", "kind: 'UNKNOWN'");

async function submitFile() {
  const dropzone = await screen.findByTestId('dropzone');
  await act(async () => {
    fireEvent.change(dropzone.querySelector('input[type="file"]')!, {
      target: { files: [new File(['content'], 'report.pdf', { type: 'application/pdf' })] }
    });
    await Promise.resolve();
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
}

const NavigationBlocker = vi.fn((_props: NavigationBlockerProps) => null);

function isNavigationBlocked() {
  return NavigationBlocker.mock.lastCall?.[0].active;
}

async function beginAt(bundle: string, onSubmit = vi.fn()) {
  render(
    <ScalarInstrumentRenderer
      NavigationBlocker={NavigationBlocker}
      target={{ bundle, id: 'target-id' }}
      onSubmit={onSubmit}
    />
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
  return { onSubmit };
}

describe('ScalarInstrumentRenderer', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
    NavigationBlocker.mockClear();
  });

  it('should show a spinner while the bundle is still being interpreted', () => {
    const { container } = render(
      <ScalarInstrumentRenderer target={{ bundle: FORM_BUNDLE, id: 'x' }} onSubmit={vi.fn()} />
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should show a placeholder and call onCompileError when the bundle fails to evaluate', async () => {
    const onCompileError = vi.fn();
    render(
      <ScalarInstrumentRenderer
        target={{ bundle: "(() => { throw new Error('boom'); })()", id: 'x' }}
        onCompileError={onCompileError}
        onSubmit={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Failed to Load Instrument')).toBeTruthy();
    });
    expect(onCompileError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should render the overview, then the form, for a FORM instrument', async () => {
    await beginAt(FORM_BUNDLE);
    expect(await screen.findByLabelText('Answer')).toBeTruthy();
  });

  it('should call onSubmit and show the summary for a valid submission', async () => {
    const { onSubmit } = await beginAt(FORM_BUNDLE);
    fireEvent.change(screen.getByLabelText('Answer'), { target: { value: 'hello' } });
    fireEvent.submit(screen.getByTestId('form-content'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
    expect(await screen.findByText('Stub Form')).toBeTruthy();
  });

  it('should render InteractiveContent for an INTERACTIVE instrument', async () => {
    await beginAt(INTERACTIVE_BUNDLE);
    await waitFor(() => {
      expect(document.querySelector('iframe')).toBeTruthy();
    });
  });

  it('should render FileInstrumentContent for a FILE instrument', async () => {
    await beginAt(FILE_BUNDLE);
    expect(await screen.findByTestId('dropzone')).toBeTruthy();
  });

  it('should not block navigation from the overview, where nothing has been entered yet', async () => {
    render(
      <ScalarInstrumentRenderer
        NavigationBlocker={NavigationBlocker}
        target={{ bundle: FORM_BUNDLE, id: 'target-id' }}
        onSubmit={vi.fn()}
      />
    );
    await screen.findByRole('button', { name: 'Begin' });
    expect(isNavigationBlocked()).toBe(false);
  });

  it('should block navigation once the instrument has begun, so a stray click cannot discard the responses', async () => {
    await beginAt(FORM_BUNDLE);
    await screen.findByLabelText('Answer');
    expect(isNavigationBlocked()).toBe(true);
  });

  it('should stop blocking navigation once the responses have been submitted', async () => {
    await beginAt(FORM_BUNDLE);
    fireEvent.change(screen.getByLabelText('Answer'), { target: { value: 'hello' } });
    fireEvent.submit(screen.getByTestId('form-content'));
    await screen.findByText('Stub Form');
    expect(isNavigationBlocked()).toBe(false);
  });

  it('should keep blocking navigation while uploaded files are still being saved', async () => {
    const onSubmit = vi.fn(() => new Promise<void>(() => undefined));
    await beginAt(FILE_BUNDLE, onSubmit);
    const dropzone = await screen.findByTestId('dropzone');
    await act(async () => {
      fireEvent.change(dropzone.querySelector('input[type="file"]')!, {
        target: { files: [new File(['content'], 'report.pdf', { type: 'application/pdf' })] }
      });
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
    expect(isNavigationBlocked()).toBe(true);
  });

  it('should still show the placeholder for a bundle that fails to evaluate when no error callback is given', async () => {
    render(
      <ScalarInstrumentRenderer
        target={{ bundle: "(() => { throw new Error('boom'); })()", id: 'x' }}
        onSubmit={vi.fn()}
      />
    );
    expect(await screen.findByText('Failed to Load Instrument')).toBeTruthy();
  });

  it('should refuse a submission its validation schema rejects, rather than pass invalid data on', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { onSubmit } = await beginAt(REJECTING_FILE_BUNDLE);
    await submitFile();
    await waitFor(() => {
      expect(useNotificationsStore.getState().notifications).toMatchObject([
        { message: expect.stringContaining('The information submitted is invalid'), type: 'error' }
      ]);
    });
    expect(onSubmit).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('should render no content for a bundle whose kind it has no content for', async () => {
    await beginAt(UNKNOWN_KIND_BUNDLE);
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Begin' })).toBeNull();
    });
    expect(document.querySelector('form, iframe, [data-testid="dropzone"]')).toBeNull();
  });
});
