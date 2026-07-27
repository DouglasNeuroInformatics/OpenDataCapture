# Bugs found while writing e2e tests

Found while writing Playwright coverage for `apps/web`/`apps/gateway` (branch `e2e-tests`). No broken
path is asserted as passing behavior in the new specs; it is described here instead. Where a finding
turned on whether some _adjacent_ behavior is correct, that adjacent behavior is now asserted — see
the `server-side authorization` block in `testing/src/specs/authorization.spec.ts`, which pins the
API-side access control that #3 depends on.

## High priority

### 1. A `GROUP_MANAGER` can create groups, because a conditional `manage` rule passes the route guard

`apps/api/src/auth/ability.factory.ts` gives a group manager
`can('manage', 'Group', { id: { in: groupIds } })`. `JwtAuthGuard` evaluates `@RouteAccess` against
the subject **type** only, and CASL ignores a rule's conditions for a type-level check, so
`ability.can('create', 'Group')` is `true` for every group manager. Confirmed by building that exact
rule set with `@casl/prisma` and calling `can` directly:

```
can('create', 'Group') => true     can('create', 'User') => false
can('update', 'Group') => true     can('manage', 'all')  => false
```

Every other route in this family survives that because the service narrows the query by real rows
(`accessibleQuery` in the `where`) — Layer 2 in
`.agents/docs/architecture/auth-and-permissions.md`. `GroupsService.create` is the exception: it
takes no `ability` parameter at all, and a create has no existing row to scope against, so nothing
checks the caller a second time.

**Repro:** `POST /v1/groups` with a group manager's token → `201`. Also reachable through the UI:
`/admin/groups/create` renders for a group manager (see #3), so the form submits successfully and
redirects to a group list.

**Impact is bounded but real:** the created group is instance-wide, is connected to every non-repo
instrument, occupies the unique-name space, and shows up in every admin's group list. It is _not_ a
data-access escalation — permissions are frozen into the JWT, so the creator is not a member of the
group they just created and cannot read anything through it.

**Fix shape:** either narrow `@RouteAccess` on `GroupsController.create` to
`{ action: 'manage', subject: 'all' }` (matching who the UI intends to expose it to), or have
`GroupsService.create` take `{ ability }` and check `ability.can('create', forcedAppSubject('Group', ...))`
against the payload. The first is smaller and matches the sibling `PATCH /v1/setup`.

**Not asserted in the specs.** `authorization.spec.ts`'s `server-side authorization` block
deliberately omits `POST /v1/groups` from `PRIVILEGED_REQUESTS` so the suite does not lock this in.

### 2. Subject Lookup's "Personal Information" method silently fails to submit

`apps/web/src/components/IdentificationForm/IdentificationForm.tsx` — the `dateOfBirth` field
(`kind: 'date'`, nested inside a `kind: 'dynamic'` wrapper) loses its committed value whenever a
_later_ field in the form re-renders it (e.g. selecting "Sex" after typing the date). Submitting
then fails client-side with a spurious "This field is required" error on `dateOfBirth`, even though
the field visibly still shows the typed date, and no network request ever fires.

**Repro:** Datahub → Subject Lookup → "Personal Information" → type First Name, Last Name, Date of
Birth, _then_ select Sex → Submit. Silent failure, no request sent.

**Not affected:** `StartSessionForm.tsx`'s `subjectDateOfBirth` (same `kind: 'date'`, but declared
statically, not inside `dynamic`), and `IdentificationForm`'s own `CUSTOM_ID` path (a
`dynamic`+`string` field, unaffected by this).

**Latent, not yet triggered:** `StartSessionForm.tsx`'s `sessionDate` field has the identical
`dynamic`+`date` shape, but happens to be the last field in that form, so today's field order never
exercises the bug. It's equally fragile to a future reorder.

## Medium priority

### 3. Admin routes have no route-level authorization — only the API stops a non-admin

`_app/route.tsx`'s `beforeLoad` checks that a token exists, not what role holds it, and no route
under `/admin` adds a check of its own. So for a non-admin who navigates directly (pasted URL,
bookmark, browser history — the sidebar hiding the link is cosmetic):

- `/admin/users`, `/admin/settings`, `/admin/branding` render fully, with a working "Save" /
  "Add User" UI, for **both `STANDARD` and `GROUP_MANAGER`**.
- `/admin/groups`, `/admin/instrument-repos` do the same for **`GROUP_MANAGER`** (`STANDARD` gets a
  403 crash screen on these two, since their loaders read endpoints it has no rule for).
- `/group/manage` renders and submits for **`STANDARD`**, which holds only `read` on `Group`.
- `/admin/audit/logs` is the only one blocked for both, because its loader is gated on `manage all`.

**This is a UX and defence-in-depth problem, not privilege escalation.** The API refuses every
privileged request those screens can fire — verified endpoint by endpoint, with `POST /v1/groups`
by a group manager (#1) as the sole exception, and now pinned by the `server-side authorization`
block in `testing/src/specs/authorization.spec.ts`:

| Screen                               | Request                               | Non-admin result                      |
| ------------------------------------ | ------------------------------------- | ------------------------------------- |
| `/admin/users`                       | `POST` / `PATCH` / `DELETE /v1/users` | `403`                                 |
| `/admin/settings`, `/admin/branding` | `PATCH /v1/setup`                     | `403`                                 |
| `/admin/instrument-repos`            | `POST /v1/instrument-repos`           | `403`                                 |
| `/admin/audit/logs`                  | `GET /v1/audit/logs`                  | `403`                                 |
| `/admin/groups`, `/group/manage`     | `PATCH` / `DELETE /v1/groups/:id`     | refused unless a member               |
| `/admin/groups/create`               | `POST /v1/groups`                     | **succeeds** for `GROUP_MANAGER` (#1) |

Reads are row-scoped the same way, so the "live data" those tables show is data the role can already
see elsewhere: `GET /v1/users` returns only the acting user's own group for a `GROUP_MANAGER`, and
only their own account for a `STANDARD` user (both asserted in the same block).

So what a non-admin actually gets is a fully-rendered admin screen whose every button fails — worth
fixing as UI, at whatever priority that deserves.

**Where a route _is_ blocked, the failure mode is rough:** a full-page
`SOMETHING WENT WRONG / 403 - Forbidden` crash screen rather than a redirect, unlike `/dashboard`,
which does an explicit `beforeLoad`/`loader` redirect to `/session/start-session` for a role that
should not be there.

### 4. Start Session's custom-identifier path shows a duplicate, contradictory validation error

`apps/web/src/components/StartSessionForm/StartSessionForm.tsx` — the Custom Identifier
`superRefine` checks `!val.subjectId` to add a "This field is required" error. When the
identifier's own `.refine()` (format check) fails, Zod hands `superRefine` an `undefined`
`subjectId` even though the user typed a non-empty value, so a genuinely-filled field gets a
spurious second "This field is required" error alongside the real "Illegal character" one.

**Repro:** Start Session → Custom Identifier → type `abc$def` as Identifier, fill valid DOB + Sex →
Submit → two errors under Identifier: "Illegal character: $" **and** "This field is required".

### 5. Admin "manage user" edit sheet silently requires a group, asymmetric with the create form

`apps/web/src/routes/_app/admin/users/index.tsx` — the update-user schema requires `groupIds` to be
non-empty for any role other than `ADMIN` (a `.check()` pushes an inline "Standard user must be part
of a group" issue). The **create**-user form (`admin/users/create.tsx`) has no such requirement —
`groupIds` is fully optional there — so it's possible to create a `GROUP_MANAGER`/`STANDARD` user
with zero groups, and then be unable to save _any_ edit to them from the "Manage" sheet without also
assigning a group, with no top-level error surfaced (it's an inline field error near "Groups"), so a
caller only watching for a success toast just sees the submit silently do nothing.

**Repro:** create a user via the API with no `groupIds`, open them from `/admin/users` → "Manage",
change only the Email field, click Submit. No request fires, no toast, no visible error unless you
scroll to the Groups field.

### 6. Audit log UI offers filters that can never return a result

`/admin/audit/logs`'s Entity filter offers `GROUP`, `USER`, `INSTRUMENT`, `INSTRUMENT_RECORD`,
`SESSION`, `SUBJECT` — but grepping `apps/api`, only `assignments.service.ts` (Assignment CRUD) and
`auth.service.ts` (Login) ever call `AuditLogger.log()`. Creating, updating, or deleting a Group,
User, Instrument, Subject, or InstrumentRecord is never audited, so those filter options are dead
ends.

## Rare / unconfirmed

### 7. An instrument occasionally doesn't appear in the subject graph tab's selector moments after its record is created

`apps/web/src/routes/_app/datahub/$subjectId/graph.tsx`, via `useInstrumentVisualization` →
`useInstrumentInfoQuery` (`GET /v1/instruments/info`). In roughly 1 of every 8 full suite runs while
developing this coverage, navigating straight from completing an instrument to that subject's Graph
tab left the instrument missing from the selector, even though it's reliably present at that exact
point when checked via the Table tab instead. Neither the client query (`staleTime: 0`, full route
remount on tab switch) nor the server-side Prisma query
(`apps/api/src/instruments/instruments.service.ts#find`, `records.some.subjectId`) showed an obvious
reason for a gap through static reading — the two tabs' data-fetch paths look equivalent. A
`page.reload()` sometimes recovered it and sometimes didn't in repeated runs, which reads as a rare
write-visibility race somewhere between the record write and this specific read, not a client-side
caching bug. **Worked around** in `SubjectGraphPage.selectInstrument`
(`testing/src/pages/_app/datahub/$subjectId/graph.page.ts`) with a bounded retry-and-reload loop
rather than asserting the race away; worth a look with real network tracing if it recurs.

## Minor / informational

### 8. Duplicate `data-testid="subject-table"` on two elements

`apps/web/src/routes/_app/datahub/$subjectId/route.tsx` (the "Table" tab `<Link>`) and
`apps/web/src/routes/_app/datahub/$subjectId/table/index.tsx` (the `<DataTable>` itself) both carry
`data-testid="subject-table"`, and both are present in the DOM simultaneously whenever that tab is
active. `page.getByTestId('subject-table')` is ambiguous. (Worked around in the new specs with
`data-table-body`/`data-table-row` and role-based tab links instead.)

### 9. `/contact` form shows an untranslated raw Zod message for one field

Submitting `/contact` empty shows the properly localized "This field is required" under Message, but
the "Reason" select shows the raw Zod message instead: `Invalid option: expected one of
"bug"|"feedback"|"other"|"request"`. Inconsistent i18n polish, not broken functionality.

### 10. Vendored `libui` `Form` component's submit button ignores a custom label for its accessible name

Not a bug in this repo — `@douglasneuroinformatics/libui`'s `Form` component
(`dist/components/Form/Form.tsx`) hardcodes `aria-label="Submit"` on its submit button regardless of
a custom `submitBtnLabel`. Confirmed on the login form (visible text "Login", accessible name
"Submit") and the user-edit sheet (visible "Save", accessible name "Submit"). Flagging because every
new e2e test that clicks a `Form`-generated submit button has to target it by
`getByRole('button', { name: 'Submit' })`, never by its visible label.

## Already fixed in the same change (not filed above)

- `apps/web/src/providers/DisclaimerProvider.tsx` had `data-test-id` (with a hyphen) instead of
  `data-testid` on all four of its selectors, so the disclaimer dialog was never actually reachable
  by Playwright's default testid convention. Renamed to `data-testid` directly rather than filing it,
  since it was a one-line, unambiguous typo fix needed to write the disclaimer tests at all.
- `apps/web/src/components/UserDropup/UserDropup.tsx`'s trigger manually called `setIsOpen(!isOpen)`
  in an `onClick` _on top of_ Radix's own controlled `open`/`onOpenChange` handling on the same
  `DropdownMenu.Trigger` (`asChild`), which already toggles via `onPointerDown`. Both handlers fire
  on one real click, and the second (stale-`isOpen`-driven) toggle intermittently flipped the menu
  straight back shut, so a normal click on the sidebar's user menu sometimes silently did nothing.
  Removed the redundant `onClick`; Radix's own controlled toggle is sufficient. This was blocking
  reliable e2e coverage of logout, the disclaimer's decline path, and the profile page nav link, so
  it was fixed directly rather than filed and worked around.
