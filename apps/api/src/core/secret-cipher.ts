import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

/** Derive a 32-byte AES key from the server `SECRET_KEY`. */
function encryptionKey(secretKey: string): Buffer {
  return createHash('sha256').update(secretKey).digest();
}

/**
 * Encrypt a secret with AES-256-GCM under a key derived from the server `SECRET_KEY`, returning
 * `iv.authTag.ciphertext` (all base64) so a database dump yields no usable credential.
 */
export function encryptSecret(plaintext: string, secretKey: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(secretKey), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join('.');
}

/**
 * Reverse {@link encryptSecret}.
 *
 * Throws when the payload is malformed or fails authentication — which is what rotating
 * `SECRET_KEY` looks like. Callers decide whether that is fatal: losing a mail password should
 * surface, while a GitHub token that no longer decrypts is recoverable by re-entering it.
 */
export function decryptSecret(value: string, secretKey: string): string {
  const [ivB64, authTagB64, ciphertextB64] = value.split('.');
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error('Malformed encrypted secret: expected iv.authTag.ciphertext');
  }
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(secretKey), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextB64, 'base64')), decipher.final()]).toString('utf8');
}
