import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CopyButton } from '../CopyButton';

describe('CopyButton', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
  });

  afterEach(cleanup);

  it('should copy the given text to the clipboard when clicked', async () => {
    const { container } = render(<CopyButton text="copy me" />);
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/unbound-method -- a vitest mock, never invoked as a method
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('copy me');
    });
  });

  it('should reset to ready when the mouse leaves after a successful copy', async () => {
    const { container } = render(<CopyButton text="copy me" />);
    const button = container.querySelector('button')!;
    fireEvent.click(button);
    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/unbound-method -- a vitest mock, never invoked as a method
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
    fireEvent.mouseLeave(button);
    fireEvent.click(button);
    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/unbound-method -- a vitest mock, never invoked as a method
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(2);
    });
  });

  it('should log an error rather than throw when the clipboard write rejects', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) }
    });
    const { container } = render(<CopyButton text="copy me" />);
    fireEvent.click(container.querySelector('button')!);
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    errorSpy.mockRestore();
  });
});
