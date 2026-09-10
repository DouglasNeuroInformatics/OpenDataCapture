import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { FileInstrumentContent } from '../FileInstrumentContent';

import type { FileInstrumentContentProps } from '../types';

function createFile(name: string, type = 'application/pdf') {
  return new File(['content'], name, { type });
}

function createProps(overrides: Partial<FileInstrumentContentProps> = {}): FileInstrumentContentProps {
  return {
    instrument: {
      content: {
        fileGroups: [{ basename: 'document', count: { max: 1, min: 1 }, label: 'Document', type: 'application/pdf' }]
      },
      id: 'instrument-id'
    } as any,
    onSubmit: vi.fn().mockResolvedValue(undefined),
    ...overrides
  };
}

function selectFile(dropzone: HTMLElement, file: File) {
  const input = dropzone.querySelector('input[type="file"]')!;
  fireEvent.change(input, { target: { files: [file] } });
}

describe('FileInstrumentContent', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('should render one dropzone per file group', () => {
    render(<FileInstrumentContent {...createProps()} />);
    expect(screen.getAllByTestId('dropzone')).toHaveLength(1);
  });

  it('should show a validation error rather than submit when a required file is missing', async () => {
    const props = createProps();
    render(<FileInstrumentContent {...props} />);
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByTestId('error-box')).toBeTruthy();
    });
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('should submit successfully and call onSuccess once uploaded', async () => {
    const onSuccess = vi.fn();
    const props = createProps({ onSuccess });
    render(<FileInstrumentContent {...props} />);

    await act(async () => {
      selectFile(screen.getByTestId('dropzone'), createFile('report.pdf'));
      await Promise.resolve();
    });
    fireEvent.click(screen.getByText('Submit'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(props.onSubmit).toHaveBeenCalledOnce();
  });

  it('should show a generic error and re-enable submission when the upload fails', async () => {
    const props = createProps({ onSubmit: vi.fn().mockRejectedValue(new Error('network error')) });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<FileInstrumentContent {...props} />);

    await act(async () => {
      selectFile(screen.getByTestId('dropzone'), createFile('report.pdf'));
      await Promise.resolve();
    });
    fireEvent.click(screen.getByText('Submit'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeTruthy();
    });
    expect(screen.getByRole('button', { name: 'Submit' }).hasAttribute('disabled')).toBe(false);
    errorSpy.mockRestore();
  });

  it('should pass the pending status through to a given NavigationBlocker', async () => {
    const NavigationBlocker = vi.fn((_props: { active: boolean; message: string }) => null);
    const props = createProps({ NavigationBlocker });
    render(<FileInstrumentContent {...props} />);

    await act(async () => {
      selectFile(screen.getByTestId('dropzone'), createFile('report.pdf'));
      await Promise.resolve();
    });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(NavigationBlocker.mock.calls.some(([props]) => props.active)).toBe(true);
    });
  });
});
