# Add a blog post

Every post, in both languages, lives in one flat `/blog` directory at the repo root.
`apps/outreach/src/content/blog` is a symlink to it (see `apps/outreach/AGENTS.md`). This guidance
is a playbook rather than a `blog/AGENTS.md` because the `blog` collection loads every `.md` file in
that directory as a post.

## Steps

1. **Create `/blog/<slug>.md`.** The filename becomes the URL slug.
2. **Copy the frontmatter of `blog/open-data-capture-v2.md`.** The `blog` collection in
   `apps/outreach/src/content/config.ts` is the schema. `language` (`en` or `fr`) routes the post
   to `/en/blog/…` or `/fr/blog/…`. `author` must match a filename, without its extension, in
   `apps/outreach/src/content/team/`. A wrong `author` fails the whole build, not just that page.
   Leave reading time out: a remark plugin in `apps/outreach/astro.config.ts` computes it.
3. **To add a new `type` value**, extend the enum in `config.ts` _and_ add the matching key to
   `apps/outreach/src/i18n/translations/blog.json`. The badge renders `t('blog.<type>')`, so
   without the key it shows the raw key.
4. **To translate a post, give the translation its own filename in its language and set
   `translationOf` to the original's filename without `.md`.** Set it on the translation only:
   `getPublishedAltPost()` in `apps/outreach/src/lib/blog.ts` pairs the two from that one field and
   fails the build if it names no post, if a post would pair with more than one other, or if both
   are in the same language. Without it, the language toggle on either post goes to the other
   language's blog index instead of the translation.

## Traps

- **Pages read posts through `getPublishedPosts()` (`apps/outreach/src/lib/blog.ts`), never
  `getCollection('blog')`.** The helper drops `isDraft: true` posts. A page that calls
  `getCollection` directly publishes them again. A draft is still public in the repository, so
  `isDraft` does not keep a post private.

## Verify

```sh
pnpm --filter @opendatacapture/outreach lint    # astro check: bad author, missing field, invalid type
pnpm --filter @opendatacapture/outreach build
```
