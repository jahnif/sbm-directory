# School Year Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace irreversible hard-delete with reversible soft-archiving, so departed families can be removed from the directory each school year without destroying their data.

**Architecture:** A `status` column on `families` drives a single filter on the public directory. Archive and restore live inside the existing `/admin` panel, revealed only when a second password sets an httpOnly cookie. Hard delete is removed from the UI entirely.

**Tech Stack:** Next.js 16.1.6 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (Postgres + Storage), next-intl.

**Spec:** `docs/superpowers/specs/2026-09-05-school-year-transition-design.md`

## Global Constraints

- **No test framework exists in this project.** There is no test runner, no test files, and no `test` script in `package.json`. Every task below verifies manually against a running dev server. Do NOT add a test framework — that is explicitly out of scope per the spec.
- **Verify with:** `npm run lint` and `npx tsc --noEmit` after every code task. Both must pass before committing.
- **Dev server:** `npm run dev`, then visit `http://localhost:3000`. The site password gate at `/login` uses `NEXT_PUBLIC_SITE_PASSWORD` from `.env.local`.
- **Back up before Task 1:** `node scripts/backup-supabase.js`. A backup from 2026-09-05 already exists at `~/backups/sbm-yearbook/2026-09-05T19-46-10` (41 families, 79 adults, 60 children, 232 photos).
- **`SUPABASE_PASS` in `.env.local` was rotated after that backup.** If the backup script fails to authenticate, the stored password is stale and must be updated from the Supabase dashboard.
- **Database connection:** the direct host `db.eflfxgtcvmvszefuiznz.supabase.co` is IPv6-only and unreachable from IPv4-only networks. Use the session pooler: host `aws-1-us-east-2.pooler.supabase.com`, port `5432`, user `postgres.eflfxgtcvmvszefuiznz`. Note `aws-1`, not `aws-0`.
- **Style:** run `npm run format` before committing. Prettier config is at `.prettierrc`.
- **Commit frequently** — one commit per task, as specified in each task's final step.

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `migrations/009_add_family_archiving.sql` | Create | Adds `status` + `archived_at` to `families` |
| `src/types/index.ts` | Modify (~line 1-14) | `Family` interface gains the two fields |
| `src/lib/supabase.ts` | Modify (~lines 13-45) | `Database` families Row/Insert/Update gain the two fields |
| `src/app/page.tsx` | Modify (line 83) | Directory filters to active families |
| `src/app/api/admin-auth/route.ts` | Create | POST verifies password + sets cookie; GET reports status; DELETE clears it |
| `src/app/admin/page.tsx` | Modify (lines 52-71, 223-243) | Remove delete; add gate UI, view toggle, archive/restore |
| `CLAUDE.md` | Modify (append) | Annual runbook + manual GDPR deletion procedure |

---

### Task 1: Database migration

**Files:**
- Create: `migrations/009_add_family_archiving.sql`

**Interfaces:**
- Consumes: nothing
- Produces: `families.status` (`'active' | 'archived'`, NOT NULL, default `'active'`) and `families.archived_at` (nullable timestamptz). All later tasks depend on these column names.

- [ ] **Step 1: Take a fresh backup**

```bash
node scripts/backup-supabase.js
```

Expected: ends with `Done. /Users/joseph/backups/sbm-yearbook/<timestamp>`. If it fails on authentication, `SUPABASE_PASS` in `.env.local` is stale — get the current password from Supabase dashboard → Project Settings → Database.

- [ ] **Step 2: Record the pre-migration state**

```bash
set -a && . ./.env.local && set +a && export PGPASSWORD="$SUPABASE_PASS"
psql -h aws-1-us-east-2.pooler.supabase.com -p 5432 -U postgres.eflfxgtcvmvszefuiznz -d postgres \
  -tAc "select count(*) from families;"
```

Expected: `41` (or whatever the current count is — write it down, Step 5 compares against it).

- [ ] **Step 3: Write the migration file**

Create `migrations/009_add_family_archiving.sql`:

```sql
-- Add soft-archiving to families, replacing hard deletion.
-- Archived families are hidden from the public directory but keep all
-- their adults, children, and photos, so archiving is reversible.

ALTER TABLE families
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived')),
  ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_families_status ON families(status);

COMMENT ON COLUMN families.status IS 'active = shown in directory; archived = hidden but retained';
COMMENT ON COLUMN families.archived_at IS 'When the family was archived; null while active';
```

- [ ] **Step 4: Apply the migration**

Run it in the Supabase SQL editor (dashboard → SQL Editor → paste → Run), or via psql:

```bash
set -a && . ./.env.local && set +a && export PGPASSWORD="$SUPABASE_PASS"
psql -h aws-1-us-east-2.pooler.supabase.com -p 5432 -U postgres.eflfxgtcvmvszefuiznz -d postgres \
  -f migrations/009_add_family_archiving.sql
```

Expected: `ALTER TABLE`, `CREATE INDEX`, `COMMENT`, `COMMENT`.

- [ ] **Step 5: Verify every existing family is active**

```bash
set -a && . ./.env.local && set +a && export PGPASSWORD="$SUPABASE_PASS"
psql -h aws-1-us-east-2.pooler.supabase.com -p 5432 -U postgres.eflfxgtcvmvszefuiznz -d postgres \
  -tAc "select status, count(*) from families group by status;"
```

Expected: one row, `active|41` — the same total recorded in Step 2, with no `archived` row and no nulls.

- [ ] **Step 6: Verify the constraint rejects bad values**

```bash
set -a && . ./.env.local && set +a && export PGPASSWORD="$SUPABASE_PASS"
psql -h aws-1-us-east-2.pooler.supabase.com -p 5432 -U postgres.eflfxgtcvmvszefuiznz -d postgres \
  -tAc "update families set status='bogus' where id=(select id from families limit 1);"
```

Expected: FAILS with `new row for relation "families" violates check constraint "families_status_check"`. This is the desired outcome — the constraint works. No row is changed.

- [ ] **Step 7: Commit**

```bash
git add migrations/009_add_family_archiving.sql
git commit -m "Add status and archived_at columns to families

Enables reversible soft-archiving in place of hard deletion."
```

---

### Task 2: TypeScript types

**Files:**
- Modify: `src/types/index.ts` (the `Family` interface, lines 1-14)
- Modify: `src/lib/supabase.ts` (the `families` block of `Database`, lines 13-45)

**Interfaces:**
- Consumes: the columns from Task 1.
- Produces: `Family.status: 'active' | 'archived'` and `Family.archived_at: string | null`. Tasks 3 and 5 read these.

- [ ] **Step 1: Add the fields to the Family interface**

In `src/types/index.ts`, the `Family` interface currently ends with `codigo_postal`, `created_at`, `updated_at`, then `adults` and `children`. Add the two fields after `codigo_postal`:

```ts
export interface Family {
  id: string
  family_name: string
  description: string
  family_name_es?: string | null
  description_es?: string | null
  original_language: 'en' | 'es'
  barrio: string | null
  codigo_postal: string | null
  status: 'active' | 'archived'
  archived_at: string | null
  created_at: string
  updated_at: string
  adults: Adult[]
  children: Child[]
}
```

- [ ] **Step 2: Add the fields to the Database type**

`src/lib/supabase.ts` maintains a hand-written `Database` type. All three shapes need updating. In the `families` block, add to `Row` (required, since the column is NOT NULL with a default):

```ts
          status: 'active' | 'archived'
          archived_at: string | null
```

...and to both `Insert` and `Update` (optional, since the default supplies it):

```ts
          status?: 'active' | 'archived'
          archived_at?: string | null
```

Place them after `original_language` in each of the three shapes.

- [ ] **Step 3: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no output (success). If it reports errors about `status` missing on object literals in `src/app/register/page.tsx`, that is expected and correct — registration does not set `status`, relying on the DB default. Because `Insert` marks it optional, this should NOT error; if it does, confirm you added it to `Insert` and not only `Row`.

- [ ] **Step 4: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
npm run format
git add src/types/index.ts src/lib/supabase.ts
git commit -m "Add status and archived_at to Family types"
```

---

### Task 3: Filter the public directory

**Files:**
- Modify: `src/app/page.tsx:83`

**Interfaces:**
- Consumes: `families.status` from Task 1.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the filter**

In `src/app/page.tsx`, inside `loadFamilies`, the families query at line 83 currently reads:

```ts
      const { data: familiesData, error: familiesError } = await supabase
        .from('families')
        .select('*')
        .order('family_name')
```

Change it to:

```ts
      const { data: familiesData, error: familiesError } = await supabase
        .from('families')
        .select('*')
        .eq('status', 'active')
        .order('family_name')
```

Leave the `adults` and `children` queries below (lines ~90 and ~96) untouched. They are joined client-side against `familiesData`, so rows belonging to an archived family fall out on their own.

- [ ] **Step 2: Verify the directory still shows everything**

```bash
npm run dev
```

Visit `http://localhost:3000`, entering the site password if prompted. Expected: all 41 families listed, exactly as before. Nothing is archived yet, so this confirms the filter does not over-filter.

- [ ] **Step 3: Archive one family by hand and confirm it disappears**

```bash
set -a && . ./.env.local && set +a && export PGPASSWORD="$SUPABASE_PASS"
psql -h aws-1-us-east-2.pooler.supabase.com -p 5432 -U postgres.eflfxgtcvmvszefuiznz -d postgres \
  -tAc "update families set status='archived', archived_at=now()
        where id=(select id from families order by family_name limit 1)
        returning family_name;"
```

Note the returned family name. Reload `http://localhost:3000`.

Expected: 40 families, and the named family is absent. Its adults and children are absent too — confirm by searching the page for one of that family's adult names.

- [ ] **Step 4: Restore it**

```bash
set -a && . ./.env.local && set +a && export PGPASSWORD="$SUPABASE_PASS"
psql -h aws-1-us-east-2.pooler.supabase.com -p 5432 -U postgres.eflfxgtcvmvszefuiznz -d postgres \
  -tAc "update families set status='active', archived_at=null
        where status='archived' returning family_name;"
```

Reload. Expected: 41 families again, with the restored family complete — photos, adults, and children all present. **This is the check the whole soft-archive design rests on.**

- [ ] **Step 5: Commit**

```bash
npm run format
git add src/app/page.tsx
git commit -m "Filter public directory to active families"
```

---

### Task 4: Admin auth route

**Files:**
- Create: `src/app/api/admin-auth/route.ts`

**Interfaces:**
- Consumes: `process.env.ADMIN_PASSWORD`.
- Produces: three endpoints Task 5 calls —
  - `POST /api/admin-auth` with body `{ password: string }` → `{ success: true }` (200) and sets the `admin-access` cookie, or `{ success: false, error: string }` (401).
  - `GET /api/admin-auth` → `{ isAdmin: boolean }` (200).
  - `DELETE /api/admin-auth` → `{ success: true }` (200), clearing the cookie.

- [ ] **Step 1: Add ADMIN_PASSWORD to the environment**

Add to `.env.local` (choose any value; generate one with `openssl rand -base64 18`):

```
ADMIN_PASSWORD=<your chosen password>
```

Note the deliberate absence of the `NEXT_PUBLIC_` prefix — unlike `NEXT_PUBLIC_SITE_PASSWORD`, this value must never reach the browser. Also add the same key and value to the Dokploy environment config, or the gate will not work in production.

- [ ] **Step 2: Add it to .env.example**

Append to `.env.example`:

```
# Password for admin-only actions (archive/restore). Server-side only --
# do NOT add a NEXT_PUBLIC_ prefix.
ADMIN_PASSWORD=your-admin-password
```

- [ ] **Step 3: Write the route**

Create `src/app/api/admin-auth/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'admin-access'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// Constant-time-ish comparison. Not a meaningful defense here (the gate is
// UI-only per the design doc), but avoids the most obvious timing leak.
function matches(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function GET(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD
  const cookie = request.cookies.get(COOKIE_NAME)
  const isAdmin = Boolean(expected && cookie && matches(cookie.value, expected))
  return NextResponse.json({ isAdmin })
}

export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json(
      { success: false, error: 'Admin access is not configured' },
      { status: 500 }
    )
  }

  let password: unknown
  try {
    password = (await request.json())?.password
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }

  if (typeof password !== 'string' || !matches(password, expected)) {
    return NextResponse.json(
      { success: false, error: 'Incorrect password' },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE,
    path: '/',
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}
```

Note `/api/*` is excluded from the proxy matcher in `src/proxy.ts`, so this route is reachable without the site-password cookie. That matches the existing API routes and is acceptable — it reveals nothing without the correct password.

- [ ] **Step 4: Verify a wrong password is rejected**

With `npm run dev` running:

```bash
curl -s -X POST http://localhost:3000/api/admin-auth \
  -H 'Content-Type: application/json' -d '{"password":"wrong"}'
```

Expected: `{"success":false,"error":"Incorrect password"}`.

- [ ] **Step 5: Verify the correct password sets the cookie**

Substitute your real password:

```bash
curl -s -i -X POST http://localhost:3000/api/admin-auth \
  -H 'Content-Type: application/json' -d '{"password":"YOUR_PASSWORD"}' | grep -iE "set-cookie|success"
```

Expected: a `Set-Cookie: admin-access=...; HttpOnly` header and `{"success":true}`. Confirm `HttpOnly` is present.

- [ ] **Step 6: Verify GET reports status correctly**

```bash
curl -s http://localhost:3000/api/admin-auth
```

Expected: `{"isAdmin":false}` — no cookie sent.

```bash
curl -s -c /tmp/c.txt -X POST http://localhost:3000/api/admin-auth \
  -H 'Content-Type: application/json' -d '{"password":"YOUR_PASSWORD"}' > /dev/null
curl -s -b /tmp/c.txt http://localhost:3000/api/admin-auth
```

Expected: `{"isAdmin":true}`. Then clean up: `rm -f /tmp/c.txt`.

- [ ] **Step 7: Verify lint and types**

```bash
npm run lint && npx tsc --noEmit
```

Expected: both pass with no errors.

- [ ] **Step 8: Commit**

```bash
npm run format
git add src/app/api/admin-auth/route.ts .env.example
git commit -m "Add admin-auth route for gating destructive actions

Second password, checked server-side, setting an httpOnly cookie.
Deliberately not NEXT_PUBLIC_ so the value never reaches the browser."
```

---

### Task 5: Admin panel — remove delete, add gated archive/restore

**Files:**
- Modify: `src/app/admin/page.tsx` (remove lines 52-71 and the delete button at ~233-243; add gate UI, view toggle, archive/restore)

**Interfaces:**
- Consumes: `families.status` (Task 1), `Family.status`/`archived_at` (Task 2), the three `/api/admin-auth` endpoints (Task 4).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add state for the gate and the view**

In `src/app/admin/page.tsx`, replace the existing state block:

```tsx
  const [families, setFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
```

with:

```tsx
  const [families, setFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [view, setView] = useState<'active' | 'archived'>('active')
  const [archiveConfirm, setArchiveConfirm] = useState<string | null>(null)
```

`deleteConfirm` is gone — hard delete is being removed entirely.

- [ ] **Step 2: Make the query respect the current view**

Replace the families query inside `loadFamilies` (line ~21):

```tsx
      const { data: familiesData, error: familiesError } = await supabase
        .from('families')
        .select('*')
        .order('family_name')
```

with:

```tsx
      const { data: familiesData, error: familiesError } = await supabase
        .from('families')
        .select('*')
        .eq('status', view)
        .order('family_name')
```

- [ ] **Step 3: Check admin status on mount, and reload when the view changes**

Replace the existing effect:

```tsx
  useEffect(() => {
    loadFamilies()
  }, [])
```

with:

```tsx
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin-auth')
        const data = await res.json()
        setIsAdmin(Boolean(data.isAdmin))
      } catch {
        setIsAdmin(false)
      }
    }
    checkAdmin()
  }, [])

  useEffect(() => {
    loadFamilies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])
```

The archived view is only reachable while gated, so an ungated session never requests archived rows through normal use.

- [ ] **Step 4: Replace deleteFamily with archive, restore, and login handlers**

Delete the entire `deleteFamily` function (lines ~52-71) and put these in its place:

```tsx
  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setPasswordError(data.error || 'Incorrect password')
        return
      }
      setIsAdmin(true)
      setShowPasswordField(false)
      setPasswordInput('')
    } catch {
      setPasswordError('Could not verify password')
    }
  }

  const signOutAdmin = async () => {
    await fetch('/api/admin-auth', { method: 'DELETE' })
    setIsAdmin(false)
    setView('active')
  }

  const archiveFamily = async (familyId: string) => {
    if (archiveConfirm !== familyId) {
      setArchiveConfirm(familyId)
      setTimeout(() => setArchiveConfirm(null), 5000)
      return
    }
    try {
      const { error } = await supabase
        .from('families')
        .update({ status: 'archived', archived_at: new Date().toISOString() })
        .eq('id', familyId)
      if (error) throw error
      setArchiveConfirm(null)
      await loadFamilies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive family')
    }
  }

  const restoreFamily = async (familyId: string) => {
    try {
      const { error } = await supabase
        .from('families')
        .update({ status: 'active', archived_at: null })
        .eq('id', familyId)
      if (error) throw error
      await loadFamilies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore family')
    }
  }
```

Both operations are single updates on `families`. Adults, children, and storage objects are untouched, which is what makes restore return a complete entry.

- [ ] **Step 5: Add the gate control and view toggle to the header**

In the header block, the `<div>` holding the title currently sits beside a "Back to Directory" link. Replace the surrounding flex container's contents so the admin controls appear:

```tsx
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-800 mt-1">
                Manage family directory entries
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin ? (
                <>
                  <div className="flex rounded-md border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => setView('active')}
                      className={`px-3 py-2 text-sm font-medium ${view === 'active' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setView('archived')}
                      className={`px-3 py-2 text-sm font-medium ${view === 'archived' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      Archived
                    </button>
                  </div>
                  <button
                    onClick={signOutAdmin}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Exit admin
                  </button>
                </>
              ) : showPasswordField ? (
                <form onSubmit={submitPassword} className="flex items-center gap-2">
                  <input
                    type="password"
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Admin password"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Unlock
                  </button>
                  {passwordError && (
                    <span className="text-sm text-red-600">{passwordError}</span>
                  )}
                </form>
              ) : (
                <button
                  onClick={() => setShowPasswordField(true)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Admin access
                </button>
              )}
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Back to Directory
              </Link>
            </div>
          </div>
```

- [ ] **Step 6: Update the list heading to reflect the view**

Replace:

```tsx
              <h2 className="text-lg font-semibold text-gray-900">
                All Families ({families.length})
              </h2>
```

with:

```tsx
              <h2 className="text-lg font-semibold text-gray-900">
                {view === 'archived' ? 'Archived' : 'Active'} Families (
                {families.length})
              </h2>
```

- [ ] **Step 7: Replace the delete button with gated archive/restore**

In the Actions cell, replace the `<button onClick={() => deleteFamily(family.id)}>` block entirely:

```tsx
                      <div className="flex flex-wrap gap-2 text-sm font-medium">
                        <Link
                          href={`/admin/edit/${family.id}`}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </Link>
                        {isAdmin && view === 'active' && (
                          <button
                            onClick={() => archiveFamily(family.id)}
                            className={`px-3 py-1 rounded-md transition-colors ${archiveConfirm === family.id ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                          >
                            {archiveConfirm === family.id
                              ? 'Confirm Archive?'
                              : 'Archive'}
                          </button>
                        )}
                        {isAdmin && view === 'archived' && (
                          <button
                            onClick={() => restoreFamily(family.id)}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                          >
                            Restore
                          </button>
                        )}
                      </div>
```

Archive uses the two-click arm/commit pattern inherited from the removed delete button. Restore is unconfirmed — it is harmless and reversible.

- [ ] **Step 8: Fix the empty-state message for the archived view**

The empty state currently assumes no families exist at all. Replace:

```tsx
          <div className="text-center py-12">
            <p className="text-gray-800 text-lg mb-4">
              No families have been added yet.
            </p>
            <Link
              href="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Add the first family
            </Link>
          </div>
```

with:

```tsx
          <div className="text-center py-12">
            <p className="text-gray-800 text-lg mb-4">
              {view === 'archived'
                ? 'No archived families.'
                : 'No families have been added yet.'}
            </p>
            {view === 'active' && (
              <Link
                href="/register"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Add the first family
              </Link>
            )}
          </div>
```

- [ ] **Step 9: Verify the ungated view**

With `npm run dev` running, open `http://localhost:3000/admin` in a fresh private window (so no `admin-access` cookie exists), entering the site password when prompted.

Expected:
- All 41 families listed.
- **No Delete button on any row.**
- No Archive button, no Restore button, no Active/Archived toggle.
- An "Admin access" button in the header.
- Edit still works — click one and confirm the edit form loads.

- [ ] **Step 10: Verify a wrong password is rejected**

Click "Admin access", type a wrong password, submit.

Expected: "Incorrect password" appears; no toggle or archive buttons appear.

- [ ] **Step 11: Verify the gated view and a full archive/restore round trip**

Enter the correct `ADMIN_PASSWORD`.

Expected: the Active/Archived toggle and "Exit admin" appear, and every row gains an Archive button.

Now archive a family:
1. Note a family's name and how many adults and children it shows.
2. Click Archive → the button reads "Confirm Archive?".
3. Click again → the row disappears from the list, and the count drops by one.
4. Visit `http://localhost:3000` → that family is absent from the directory.
5. Back at `/admin`, click "Archived" → the family is listed there.
6. Click Restore → it disappears from the archived view.
7. Click "Active" → it is back, and the count is restored.
8. Visit `http://localhost:3000` → the family is present again **with all its adults, children, and photos intact**.

Step 8 is the critical check. If anything is missing, stop and investigate before continuing.

- [ ] **Step 12: Verify the two-click archive auto-cancels**

Click Archive once on any row, then wait six seconds without clicking again.

Expected: the button reverts from "Confirm Archive?" to "Archive", and the family is NOT archived.

- [ ] **Step 13: Verify exiting admin re-hides everything**

Click "Exit admin".

Expected: the toggle, Archive buttons, and "Exit admin" all disappear; the view returns to Active; the "Admin access" button returns.

Then unlock again and verify the cookie itself is what gates the UI — not just
component state. In the browser devtools, delete the `admin-access` cookie
(Application → Cookies → `http://localhost:3000`), then reload the page.

Expected: the gated UI is gone after reload. This confirms the gate survives a
page load rather than living only in React state.

- [ ] **Step 14: Verify lint and types**

```bash
npm run lint && npx tsc --noEmit
```

Expected: both pass. In particular there should be no unused-variable warnings for `deleteConfirm`, which must be fully removed.

- [ ] **Step 15: Commit**

```bash
npm run format
git add src/app/admin/page.tsx
git commit -m "Replace hard delete with gated archive/restore in admin panel

Delete is removed entirely. Archive and restore are visible only with
the admin-access cookie, as is the archived-families view."
```

---

### Task 6: Document the annual runbook

**Files:**
- Modify: `CLAUDE.md` (append a new section)

**Interfaces:**
- Consumes: the behavior built in Tasks 1-5.
- Produces: nothing.

- [ ] **Step 1: Append the runbook to CLAUDE.md**

Add at the end of `CLAUDE.md`:

```markdown
---

## School Year Transition Runbook

Run at the start of each school year. Design rationale is in
`docs/superpowers/specs/2026-09-05-school-year-transition-design.md`.

Classes span multiple school years, so most returning children do not change
class. There is no bulk promotion and no re-confirmation campaign — the
rollover is mostly removals plus a trickle of self-service edits.

1. **Back up.** `node scripts/backup-supabase.js` — dumps the database and
   downloads every photo to `~/backups/sbm-yearbook/<timestamp>/`.
2. **Archive departed families.** Go to `/admin`, click "Admin access", enter
   `ADMIN_PASSWORD`, then Archive each family that has left. Archiving is
   reversible: the family keeps its adults, children, and photos, and Restore
   brings it back intact.
3. **Announce to parents.** New families register at `/register`. Existing
   families whose child changed class, or who have a new sibling starting,
   edit themselves at `/admin`.
4. **Remove graduated children individually.** For families staying with a
   younger sibling, open the family in the edit form and delete just the
   departed child.
5. **Spot-check** the directory count against the school roster.

### Admin access

Archive, restore, and the archived-families view are hidden behind
`ADMIN_PASSWORD` (set in `.env.local` and in the Dokploy environment).

**This gate controls rendering, not database access.** Writes go directly from
the browser to Supabase under permissive RLS policies, so a user with dev tools
could archive a family regardless of the UI. It prevents accidents by ordinary
parents; it does not stop a determined attacker. Making it enforced would mean
tightening RLS or routing writes through server-side routes.

### Permanently deleting a family (GDPR erasure)

Hard delete has no UI. To honor an erasure request:

1. Delete the family row in the Supabase dashboard — this cascades to their
   adults and children.
2. Delete their photos from the `family-images` storage bucket. The app has
   never done this automatically; it must be done by hand.

### Database connection

The direct host `db.eflfxgtcvmvszefuiznz.supabase.co` is IPv6-only and
unreachable from IPv4-only networks. Use the session pooler instead:

- Host: `aws-1-us-east-2.pooler.supabase.com` (note `aws-1`, not `aws-0`)
- Port: `5432` (the session pooler — the transaction pooler on 6543 does not
  support `pg_dump`)
- User: `postgres.eflfxgtcvmvszefuiznz`

### Known future work

- **Orphaned photos.** Archived families' photos stay in `family-images`
  indefinitely, and hard-deleted families already orphan theirs. Harmless now;
  a real problem after several years.
- **Server-enforced authorization.** See the admin access note above.
- **Purging old archives.** `archived_at` exists to support this; no policy is
  defined yet.
```

- [ ] **Step 2: Verify the runbook is accurate**

Re-read the steps against what you actually built in Tasks 1-5. Every UI element named (the "Admin access" button, the Active/Archived toggle, Archive and Restore) must exist with those exact labels. Fix any drift.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "Document the annual school year transition runbook"
```

---

## Post-Implementation Checklist

Run through this once all tasks are complete:

- [ ] `npm run lint` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` succeeds.
- [ ] The public directory shows only active families.
- [ ] `/admin` ungated has no Delete, no Archive, no toggle — and Edit works.
- [ ] `/admin` gated can archive, view archived, and restore.
- [ ] A restored family comes back complete: adults, children, and photos.
- [ ] `ADMIN_PASSWORD` is set in the Dokploy environment, not only `.env.local`.
- [ ] `SUPABASE_PASS` in `.env.local` matches the rotated database password.
- [ ] No family was left accidentally archived during testing — confirm with:
      `select status, count(*) from families group by status;` (expect all active).
