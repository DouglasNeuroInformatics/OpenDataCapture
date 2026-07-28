# libcrypto

Wrappers for the Web Crypto API — works in both Node and the browser.

**Status in Open Data Capture:** used for two distinct jobs.

- `HybridCrypto` secures the API ↔ gateway channel: `apps/api/src/gateway/gateway.service.ts`, `apps/api/src/gateway/gateway.synchronizer.ts`, `apps/api/src/assignments/assignments.service.ts`, and `apps/gateway/src/routers/api.router.ts`.
- `sha256` backs subject identifier hashing in `packages/subject-utils/src/index.ts` and file hashing in `apps/playground/src/utils/file.ts`.

Reach for this instead of calling `crypto.subtle` directly or adding a third-party crypto dependency.

## When to reach for this

- Need a SHA-256 hex digest of a string.
- Need hybrid public-key encryption/decryption (asymmetric key exchange plus symmetric payload encryption) between two parties.

## Key exports

- `sha256(source: string): Promise<string>` — hex-encoded SHA-256 digest.
- `HybridCrypto` — static class wrapping HPKE (Hybrid Public Key Encryption) via `@hpke/core`:
  - `generateKeyPair()`
  - `encrypt({ plainText, publicKey }): Promise<EncryptResult>`
  - `decrypt({ cipherText, privateKey, symmetricKey }): Promise<string>`
  - `serializeKeyPair` / `serializePublicKey` / `serializePrivateKey`
  - `deserializePublicKey` / `deserializePrivateKey`
- Types: `EncryptParams`, `EncryptResult`, `DecryptParams`.

Confirm exact signatures against the source before use — this wraps an evolving HPKE suite, and the serialize/deserialize methods take `ArrayBufferLike | ArrayBufferView`, not strings.

## Minimal usage

```ts
import { sha256 } from '@douglasneuroinformatics/libcrypto';

const digest = await sha256('some-input');
```

## Reading the source

Publishes `src` alongside `dist`, so the original TypeScript is right there — the whole package is five files:

```sh
ls  apps/api/node_modules/@douglasneuroinformatics/libcrypto/src                 # index, hash, encryption (+ tests)
cat apps/api/node_modules/@douglasneuroinformatics/libcrypto/src/encryption.ts
cat apps/api/node_modules/@douglasneuroinformatics/libcrypto/src/hash.ts
```

Also resolvable from `apps/gateway`, `apps/playground`, and `packages/subject-utils`.

No hosted docs site.
