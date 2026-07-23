/**
 * The uploaded login image is stored verbatim as a base64 data URI on the
 * SetupState document, so whatever the admin picks is carried in full on every
 * read. Re-encoding to WebP at upload time typically cuts that payload by well
 * over half. This uses the browser's own canvas encoder, so it costs no
 * dependency and no image size.
 */

/** Quality passed to the WebP encoder — high enough to keep logo edges clean. */
const WEBP_QUALITY = 0.92;

const readFileAsDataUrl = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
};

const encodeAsWebp = async (file: File): Promise<null | string> => {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }
    // Transparent source pixels stay transparent: the canvas starts fully
    // transparent and WebP keeps the alpha channel (unlike a JPEG re-encode).
    context.drawImage(bitmap, 0, 0);
    const dataUrl = canvas.toDataURL('image/webp', WEBP_QUALITY);
    // A browser with no WebP encoder does not throw here — `toDataURL` silently
    // falls back to its default PNG output, so the result must be checked.
    return dataUrl.startsWith('data:image/webp;base64,') ? dataUrl : null;
  } finally {
    bitmap.close();
  }
};

/**
 * Read `file` as a data URI, re-encoding it to WebP when that is both possible
 * and worthwhile. Returns the original data URI unchanged when:
 * - the file is an SVG — it is vector, so rasterizing would lose scalability and
 *   usually grow the payload;
 * - the file is already WebP — re-encoding would only add a lossy generation,
 *   and could flatten an animation;
 * - the browser cannot encode WebP, or WebP came out no smaller than the source.
 *
 * Throws if the file cannot be decoded as an image, which means it is not the
 * image its MIME type claims.
 */
export const readLogoAsWebpDataUrl = async (file: File): Promise<string> => {
  const originalDataUrl = await readFileAsDataUrl(file);
  if (file.type === 'image/svg+xml' || file.type === 'image/webp') {
    return originalDataUrl;
  }
  const webpDataUrl = await encodeAsWebp(file);
  return webpDataUrl && webpDataUrl.length < originalDataUrl.length ? webpDataUrl : originalDataUrl;
};
