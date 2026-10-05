import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import { readLogoAsWebpDataUrl } from '../image';

const SHORT_WEBP = 'data:image/webp;base64,AA';

const bitmap = { close: vi.fn(), height: 40, width: 120 };
const createImageBitmap = vi.fn<(file: File) => Promise<typeof bitmap>>();
const drawImage = vi.fn();

// happy-dom ships no canvas adapter, so the 2D context is faked with only the method the encoder calls.
const fakeContext: Pick<CanvasRenderingContext2D, 'drawImage'> = { drawImage };

const pngFile = (byteCount = 256) => new File([new Uint8Array(byteCount)], 'logo.png', { type: 'image/png' });

const readOriginal = async (file: File) => {
  return `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`;
};

const stubFileReaderError = (error: DOMException | null) => {
  vi.stubGlobal(
    'FileReader',
    class {
      error = error;
      onerror: (() => void) | null = null;
      readAsDataURL() {
        queueMicrotask(() => this.onerror?.());
      }
    }
  );
};

describe('readLogoAsWebpDataUrl', () => {
  let getContext: MockInstance<HTMLCanvasElement['getContext']>;
  let toDataURL: MockInstance<HTMLCanvasElement['toDataURL']>;

  beforeEach(() => {
    createImageBitmap.mockResolvedValue(bitmap);
    vi.stubGlobal('createImageBitmap', createImageBitmap);
    getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(fakeContext as CanvasRenderingContext2D);
    toDataURL = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(SHORT_WEBP);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('should keep an SVG as its original data URI, so a vector logo is never rasterized', async () => {
    const file = new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], 'logo.svg', { type: 'image/svg+xml' });
    await expect(readLogoAsWebpDataUrl(file)).resolves.toBe(await readOriginal(file));
    expect(createImageBitmap).not.toHaveBeenCalled();
  });

  it('should keep a WebP as its original data URI, so it does not lose a lossy generation', async () => {
    const file = new File([new Uint8Array(64)], 'logo.webp', { type: 'image/webp' });
    await expect(readLogoAsWebpDataUrl(file)).resolves.toBe(await readOriginal(file));
    expect(createImageBitmap).not.toHaveBeenCalled();
  });

  it('should return the WebP re-encoding when it is smaller than the original', async () => {
    await expect(readLogoAsWebpDataUrl(pngFile())).resolves.toBe(SHORT_WEBP);
  });

  it('should encode at the bitmap size and a high WebP quality, so logo edges stay clean', async () => {
    await readLogoAsWebpDataUrl(pngFile());
    expect(toDataURL.mock.contexts[0]).toMatchObject({ height: 40, width: 120 });
    expect(drawImage).toHaveBeenCalledWith(bitmap, 0, 0);
    expect(toDataURL).toHaveBeenCalledWith('image/webp', 0.92);
  });

  it('should keep the original when the WebP is the same size, since re-encoding would gain nothing', async () => {
    const file = pngFile(4);
    const original = await readOriginal(file);
    const webpPrefix = 'data:image/webp;base64,';
    toDataURL.mockReturnValue(webpPrefix + 'A'.repeat(original.length - webpPrefix.length));
    await expect(readLogoAsWebpDataUrl(file)).resolves.toBe(original);
  });

  it('should keep the original when the WebP is larger, so re-encoding never grows the payload', async () => {
    const file = pngFile(4);
    const original = await readOriginal(file);
    toDataURL.mockReturnValue(`data:image/webp;base64,${'A'.repeat(original.length)}`);
    await expect(readLogoAsWebpDataUrl(file)).resolves.toBe(original);
  });

  it('should keep the original when the browser silently falls back to PNG, since it cannot encode WebP', async () => {
    const file = pngFile();
    toDataURL.mockReturnValue('data:image/png;base64,AA');
    await expect(readLogoAsWebpDataUrl(file)).resolves.toBe(await readOriginal(file));
  });

  it('should keep the original when no 2D canvas context is available', async () => {
    const file = pngFile();
    getContext.mockReturnValue(null);
    await expect(readLogoAsWebpDataUrl(file)).resolves.toBe(await readOriginal(file));
    expect(toDataURL).not.toHaveBeenCalled();
  });

  it('should release the decoded bitmap even when encoding is abandoned', async () => {
    getContext.mockReturnValue(null);
    await readLogoAsWebpDataUrl(pngFile());
    expect(bitmap.close).toHaveBeenCalledOnce();
  });

  it('should reject when the file cannot be decoded, since it is not the image its type claims', async () => {
    const decodeError = new DOMException('The source image could not be decoded.', 'InvalidStateError');
    createImageBitmap.mockRejectedValue(decodeError);
    await expect(readLogoAsWebpDataUrl(pngFile())).rejects.toBe(decodeError);
  });

  it('should reject with the reader error when the file cannot be read', async () => {
    const readError = new DOMException('Permission denied', 'NotReadableError');
    stubFileReaderError(readError);
    await expect(readLogoAsWebpDataUrl(pngFile())).rejects.toBe(readError);
  });

  it('should reject with an error naming the file when the reader fails without an error', async () => {
    stubFileReaderError(null);
    await expect(readLogoAsWebpDataUrl(pngFile())).rejects.toThrow('Failed to read file: logo.png');
  });
});
