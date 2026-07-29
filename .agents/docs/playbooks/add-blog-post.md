# Add a blog post

Posts published at `opendatacapture.org/<locale>/blog`.

> This playbook exists instead of a `blog/AGENTS.md`. `apps/outreach/src/content/blog` is a symlink
> to `/blog`, and the Astro `blog` collection loads **every** `.md` file it finds there and validates
> it against the collection schema. A file without post frontmatter — including an `AGENTS.md` —
> fails `astro check` with `InvalidContentEntryDataError`. Do not add one.

## Steps

1. **Create the file in `/blog` at the repo root**, not under `apps/outreach`. The filename minus
   its extension becomes the URL slug. Both languages live side by side in this one flat directory;
   `language` in frontmatter is what routes a post to `/en/blog/…` or `/fr/blog/…`.

2. **Write the frontmatter.** `apps/outreach/src/content/config.ts` is authoritative; read
   `blog/open-data-capture-v2.md` for the current shape.

   | Field           | Type                                                                                                  |
   | --------------- | ----------------------------------------------------------------------------------------------------- |
   | `title`         | non-empty string                                                                                      |
   | `description`   | non-empty string; used as the meta description and the listing blurb                                  |
   | `author`        | `reference('team')` — must equal a filename in `apps/outreach/src/content/team/`, e.g. `joshua-unrau` |
   | `datePublished` | date, `YYYY-MM-DD`                                                                                    |
   | `language`      | `'en'` or `'fr'`                                                                                      |
   | `type`          | `'article'`, `'caseStudy'` or `'video'`                                                               |
   | `isDraft`       | optional boolean                                                                                      |

3. **Do not put reading time in frontmatter.** It is computed from the body by a remark plugin in
   `apps/outreach/astro.config.ts`.

4. **If you add a new `type` value**, edit the enum in `apps/outreach/src/content/config.ts` _and_
   add the matching key to `apps/outreach/src/i18n/translations/blog.json` as an `{ en, fr }`
   object (a bare string serves both languages, as `article` does). The badge renders
   `t('blog.<type>')`, so a missing key renders the raw key.

## Traps

- **`isDraft: true` only hides the post from the index listing.** `[slug].astro` calls
  `getCollection('blog')` unfiltered, so a draft is still built at its real URL in the published
  site. It is not a privacy mechanism.
- **`author` is resolved at build time.** A value with no matching file in
  `apps/outreach/src/content/team/` fails the whole build, not just that page.

## Verify

No test suite covers this directory. A bad `author` reference, a missing required field and an
invalid `type` all fail here:

```sh
pnpm --filter @opendatacapture/outreach lint    # astro check
pnpm --filter @opendatacapture/outreach build
```
