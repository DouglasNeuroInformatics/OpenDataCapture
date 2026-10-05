import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QRCode } from '@/components/QRCode';

const { toCanvas } = vi.hoisted(() => ({ toCanvas: vi.fn() }));

vi.mock('qrcode', () => ({ default: { toCanvas } }));

const URL = 'https://gateway.example.org/a/1';

const lastDrawCallback = (): ((error: Error | null | undefined) => void) => toCanvas.mock.lastCall?.[3];

describe('QRCode', () => {
  beforeEach(() => {
    window.localStorage.setItem('theme', 'light');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    toCanvas.mockReset();
    window.localStorage.removeItem('theme');
  });

  it('should draw the url onto the rendered canvas', () => {
    const { container } = render(<QRCode url={URL} />);
    expect(toCanvas).toHaveBeenCalledWith(
      container.querySelector('canvas'),
      URL,
      expect.any(Object),
      expect.any(Function)
    );
  });

  it('should draw dark modules in the light theme, so the code is legible on a light background', () => {
    render(<QRCode url={URL} />);
    expect(toCanvas.mock.lastCall?.[2]).toMatchObject({ color: { dark: '#0f172a', light: '#0000' } });
  });

  it('should draw light modules in the dark theme, so the code is legible on a dark background', () => {
    window.localStorage.setItem('theme', 'dark');
    render(<QRCode url={URL} />);
    expect(toCanvas.mock.lastCall?.[2]).toMatchObject({ color: { dark: '#f1f5f9' } });
  });

  it('should redraw when the url changes', () => {
    const { rerender } = render(<QRCode url={URL} />);
    rerender(<QRCode url="https://gateway.example.org/a/2" />);
    expect(toCanvas.mock.lastCall?.[1]).toBe('https://gateway.example.org/a/2');
  });

  it('should log a failed draw, so the error is not swallowed', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<QRCode url={URL} />);
    const error = new Error('Too much data');
    lastDrawCallback()(error);
    expect(consoleError).toHaveBeenCalledWith(error);
  });

  it('should log nothing when the draw succeeds', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<QRCode url={URL} />);
    lastDrawCallback()(null);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
