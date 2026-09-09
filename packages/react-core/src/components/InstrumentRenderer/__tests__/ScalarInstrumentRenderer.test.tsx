import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

import { ScalarInstrumentRenderer } from '../ScalarInstrumentRenderer';

/**
 * A bundle is evaluated with `new Function`, so it can close over nothing in this file. The
 * validation schema is handed to it through `globalThis`, which is the one scope both share.
 */
declare global {
  // eslint-disable-next-line no-var
  var __testValidationSchema: z.ZodTypeAny;
}

globalThis.__testValidationSchema = z.object({ answer: z.string().min(1) });

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
  measures: null
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

async function beginAt(bundle: string, onSubmit = vi.fn()) {
  render(<ScalarInstrumentRenderer target={{ bundle, id: 'target-id' }} onSubmit={onSubmit} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Begin' }));
  return { onSubmit };
}

describe('ScalarInstrumentRenderer', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

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
});
