# School Year Transition — Design

**Date:** 2026-09-05
**Status:** Approved for planning

## Problem

The directory has no time dimension. Families, adults, and children exist in a
permanent "now" with no year, no status, and no archive. The only way to remove
a family who has left the school is a hard `DELETE` (`src/app/admin/page.tsx:62`),
which cascades to their adults and children, is irreversible, and orphans their
photos in the `family-images` storage bucket.

Transitioning to a new school year needs a way to remove departed families that
is reversible and does not destroy data.

## Constraints that shaped this design

- **Classes span multiple years.** Most returning children do not change class,
  so there is no bulk promotion and no mass re-confirmation campaign. The
  rollover is mostly a removal operation plus a trickle of self-service edits.
- **The school administrator knows which families left** and is willing to
  archive them by hand. No automated detection is needed.
- **Auth is a single shared site password** (`src/proxy.ts`). All parents can
  already reach `/admin`. The plan is to keep it that way — families edit their
  own entries there — which means destructive actions must not be exposed to
  everyone.
- **No test infrastructure exists** in this project. Verification is manual.

## Decisions

| Decision | Choice | Rejected alternatives |
|---|---|---|
| Removing a family | Soft-archive, hidden by default | Alumni browsing; hard delete with export |
| Class progression | Families update their own class when it changes | Bulk SQL promotion; `enrollments` history table |
| Returning families | Self-serve edit via existing `/admin` | Per-family email tokens; Supabase Auth accounts |
| Confirmation tracking | None | `confirmed_year` column; `updated_at` heuristics |
| Archive/restore access | Second password, UI-gated, inside existing `/admin` | Separate super-admin panel; server-enforced route; no gate |
| Graduated child, family stays | Delete the child in the existing edit form | Per-child status column |

## Non-goals

Explicitly out of scope, and deliberately so:

- Enrollment history — the directory answers "who is in my child's class now",
  not "who was in Orion in 2025-26".
- Bulk class promotion.
- Email delivery of any kind.
- Per-family accounts or authentication.
- Server-enforced authorization (see Security note below).
- Storage cleanup for archived or deleted families (see Known future work).
- Standing up a test framework.

## Section 1: Data model

Migration `migrations/009_add_family_archiving.sql`:

```sql
ALTER TABLE families
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived')),
  ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_families_status ON families(status);
```

`status` drives all filtering. `archived_at` distinguishes a family archived this
August from one archived three years ago, which matters if rows are ever purged.

Existing rows default to `active`, so this is safe against live data with no
backfill. The migration is purely additive — nothing is dropped or rewritten.

Adults, children, and storage objects are untouched. Archiving hides a family
wholesale and the child rows ride along, so a restore returns a complete entry.

The `CHECK` constraint follows the existing idiom in this repo
(`migrations/004_add-other-class-option.sql`): adding a third status later
requires a drop-and-recreate migration.

**Type changes:**

- `Family` in `src/types/index.ts` gains `status: 'active' | 'archived'` and
  `archived_at: string | null`.
- `src/lib/supabase.ts` maintains a hand-written `Database` type. Both fields
  must be added to the families `Row`, `Insert`, and `Update` shapes.

## Section 2: Reads

**Public directory** — `src/app/page.tsx:83` gains one filter:

```ts
.from('families').select('*').eq('status', 'active').order('family_name')
```

The adults and children queries below it (lines 90, 96) are left alone. They are
joined client-side against the families array, so rows belonging to an archived
family fall out on their own. They are over-fetched; at this data volume that is
irrelevant, and filtering them would require a join or a second round trip.

**Admin list** — `src/app/admin/page.tsx:21` becomes conditional on a view
toggle. Default is active-only, matching the directory. The archived view is
reachable only in the gated state (Section 3), so an ungated session never
requests archived rows through normal use.

**Accepted consequence:** archiving is invisible to families. Someone archived
by mistake simply stops appearing, with no explanation. Acceptable because
archiving is manual and deliberate; the remedy if it ever bites is a note in the
admin list, not user-facing messaging.

## Section 3: The admin gate

A second password, server-checked.

- **Env var:** `ADMIN_PASSWORD` in `.env.local`. Deliberately *without* the
  `NEXT_PUBLIC_` prefix — unlike `NEXT_PUBLIC_SITE_PASSWORD`, this value must
  not reach the browser, which is why the check cannot follow the existing
  site-password pattern.
- **Route:** `src/app/api/admin-auth/route.ts`.
  - `POST` compares a submitted password to `process.env.ADMIN_PASSWORD` and on
    success sets an `admin-access` cookie: httpOnly, ~30 day lifetime.
  - `GET` returns `{ isAdmin: boolean }` by inspecting the cookie.
- **Client:** because the cookie is httpOnly, the admin page cannot read it
  directly. It calls `GET` on mount and stores the result in state. All gated UI
  renders off that boolean.
- **Entry point:** an "Admin access" control in the `/admin` header revealing a
  password field. Entered once; the cookie persists.

Note `/api/*` is excluded from the proxy matcher in `src/proxy.ts`, so this route
is reachable without the site-password cookie. That is consistent with the
existing API routes and acceptable — the route reveals nothing without the
correct password.

### Security note

This gate controls **rendering, not database access**. All writes go directly
from the browser to Supabase under permissive RLS policies
(`migrations/000_supabase-setup.sql` grants update and delete to everyone). A
user with dev tools could archive a family regardless of the UI state.

This is intentional and matches the threat model: the goal is preventing
accidents by ordinary parents, not stopping a determined attacker. Making it
enforced would require tightening RLS or routing writes through server-side
routes — a substantially larger change, recorded here as a known limitation
rather than an oversight.

## Section 4: Archive and restore

**Ungated view** (every parent): the family list as it is today, minus delete.
`deleteFamily` (`src/app/admin/page.tsx:52-71`) and its `deleteConfirm` state are
removed entirely. Edit remains.

**Gated view** additionally has:

- a view toggle — Active / Archived — switching the query's `.eq('status', ...)`;
- an **Archive** button per row in the active view;
- a **Restore** button per row in the archived view;
- a count badge showing how many archived families exist.

**Operations** — both single updates on `families`, touching nothing else:

- Archive: `status = 'archived'`, `archived_at = now()`.
- Restore: `status = 'active'`, `archived_at = null`.

**Confirmation:** archive reuses the existing two-click arm/commit pattern from
the removed delete button (first click arms, second within 5s commits,
auto-cancels otherwise). Restore is unconfirmed — it is harmless and reversible.

**After either action** the row leaves the current view, so the list refetches
rather than patching local state.

**Hard delete has no UI anywhere.** If a row must genuinely be destroyed — a
GDPR erasure request is plausible, given the app has a privacy policy page —
that is a manual procedure:

1. Delete the family row in the Supabase dashboard (cascades to adults, children).
2. Delete their photos from the `family-images` bucket. The app has never done
   this; it must be done by hand.

## Section 5: Backups

The site itself needs no backup — it is in git and deployed from a Dockerfile;
rollback is `git revert`. What is irreplaceable is the data, which exists only in
Supabase.

`pg_dump` and `psql` are available locally. The Supabase CLI is not.

**Script:** `scripts/backup-supabase.js` (rerunnable each August), producing:

1. **Database dump** via `pg_dump` to a timestamped `.sql` file. Requires
   `SUPABASE_DB_URL` in `.env.local` — the direct Postgres connection string
   from Supabase dashboard → Project Settings → Database. This is a separate
   credential from `SUPABASE_SERVICE_ROLE_KEY`.
2. **Storage bucket** — lists and downloads every object in `family-images`
   using the service role key. `pg_dump` does **not** cover these; they are
   object storage, not database rows.

Output goes to `~/backups/sbm-yearbook/<timestamp>/`, outside the repo. Dumps
contain every family's personal data and must never be committed. `.env*` is
already gitignored and no env file has ever been committed (verified), so no
gitignore change is needed.

**Also check** what Supabase's own plan retains — free tier has limited daily
backups, paid tiers offer point-in-time recovery. A self-held copy is still
worth having because it survives an account-level problem.

**Risk framing:** the Section 1 migration is additive and about as safe as schema
changes get. The real risk in this project is the archiving operation hiding the
wrong family — and that is reversible by design. The backup is prudent, not a
sign the migration is dangerous.

## Verification

Manual, in this order. Section 1 must be verified against a backup taken first.

- [ ] Backup script runs; dump and bucket contents land in `~/backups/`.
- [ ] Migration applies to a database with existing rows; every family is `active`.
- [ ] Directory shows all families before archiving.
- [ ] After archiving one: it disappears from the directory, and its adults and
      children go with it.
- [ ] `/admin` ungated: no delete button, no view toggle, no archive button;
      edit still works.
- [ ] `/admin` gated: toggle switches views; archive moves a family across.
- [ ] **Restore returns the family intact** — adults, children, and photos all
      present. This is the assumption the whole soft-archive design rests on.
- [ ] Clearing the `admin-access` cookie removes the gated UI.
- [ ] A wrong password does not set the cookie.

## Annual runbook

To be added to `CLAUDE.md` on implementation:

1. Run `scripts/backup-supabase.js`.
2. Archive departed families in the gated admin view.
3. Announce to parents: new families register at `/register`; existing families
   with a class change or a new sibling edit themselves at `/admin`.
4. Delete individual graduated children from families that are staying, via the
   edit form.
5. Spot-check the directory count against the school roster.

No bulk SQL, no promotion step, no confirmation tracking — the payoff from
classes spanning multiple years.

## Known future work

Recorded rather than silently dropped:

- **Orphaned photos.** Archived families' photos stay in `family-images`
  indefinitely, and hard-deleted families already orphan theirs today. Harmless
  now; a real problem after several years of accumulation.
- **Server-enforced authorization.** See the Security note in Section 3.
- **Purging old archives.** `archived_at` exists to support this; no policy is
  defined yet.
