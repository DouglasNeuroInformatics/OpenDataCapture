# libpasswd

Estimates password strength — wraps `zxcvbn-ts` and translates its feedback into EN/FR.

**Status in Open Data Capture:** used wherever a password is set or changed.

- Backend enforcement: `apps/api/src/users/users.service.ts`.
- Frontend feedback: `apps/web/src/routes/setup.tsx`, `apps/web/src/routes/_app/user.tsx`, `apps/web/src/routes/_app/admin/users/create.tsx`, and `apps/web/src/routes/_app/admin/users/index.tsx`.

## When to reach for this

- Need to score password strength or show strength feedback in a form — use this instead of calling `zxcvbn-ts` directly. It standardizes the score/feedback shape and handles EN/FR translation for you.

## Key exports

- `estimatePasswordStrength(password: string, options?: PasswordStrengthOptions): PasswordStrengthResult` — the only function. `options.feedbackLanguage` is `'en' | 'fr'` and defaults to `'en'`. The result is `{ score, success, feedback }`, where `score` is `0`–`4`, `success` is `score > 2`, and `feedback` is the translated zxcvbn `{ suggestions, warning }`.
- Types: `PasswordFeedbackLanguage`, `PasswordStrengthOptions`, `PasswordStrengthResult`.

The `success` threshold lives in the library, not in this repo — don't re-derive it from `score` at call sites.

## Minimal usage

```ts
import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';

const { feedback, score, success } = estimatePasswordStrength(password, { feedbackLanguage: 'fr' });
```

## Reading the source

Publishes `src` alongside `dist`. It is a single ~45-line file — read it rather than guessing:

```sh
cat apps/web/node_modules/@douglasneuroinformatics/libpasswd/src/index.ts
```

Also resolvable from `apps/api`.

No hosted docs site.
