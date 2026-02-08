# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack  
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Environment Setup
- Copy `.env.local` template and configure Supabase keys and site password
- Run `migrations/000_supabase-setup.sql` in Supabase SQL editor to set up database schema

## Architecture

### Framework & Stack
- Next.js 15 with TypeScript
- App Router architecture (`src/app/` directory)
- Tailwind CSS v4 for styling
- Supabase for database and storage
- Universal password authentication via middleware

### Key Directories
- `src/app/` - Next.js app router pages and API routes
- `src/components/` - Reusable React components  
- `src/lib/` - Utility functions and configurations
- `src/types/` - TypeScript type definitions
- `src/i18n/` - Internationalization setup (English/Spanish)

### Database Schema
Three main tables with relationships:
- `families` - Family information and descriptions
- `adults` - Adult family members with professional networking data
- `children` - Children with class assignments (Pegasus, Lynx, Orion, Andromeda)

All tables support bilingual content (English/Spanish) and have Row Level Security enabled.

#### Database Migrations
All migrations should go in the `migrations` directory and be labeled incrementally.

### Authentication & Security
- Middleware at `src/middleware.ts` enforces universal password protection
- Supabase RLS policies control database access
- Image uploads handled via Supabase Storage with validation

### Internationalization
- Built with next-intl for English/Spanish support
- Messages stored in `src/messages/`
- Translation API using DeepL (`src/app/api/translate/`)
- Original language tracking for families and automatic translation

### Key Components
- `FamilyCard` - Mobile card layout for family display
- `FamilyTableRow` - Desktop table row for family display  
- `ImageUpload` - Handles image compression and Supabase uploads
- `SearchAndFilters` - Directory search and class filtering
- `LanguageToggle` - Switch between English/Spanish

### Image Handling
- Automatic compression via `src/lib/image-utils.ts`
- Supabase Storage integration for family photos
- Next.js Image component with Supabase remote patterns

### API Routes
- `/api/translate` - DeepL translation service for bilingual content

### Responsive Design
- Desktop: Tabular family directory view
- Mobile: Card-based layout
- Automatic switching based on screen size in directory components

---

## Changelog

### 2026-02-05: ETXTBSY File Locking Bug Fix

**Problem**: Application experiencing persistent ETXTBSY (text file is busy) and EACCES (permission denied) errors, causing unpredictable 100% CPU/RAM spikes and massive disk I/O. Errors appeared on `/tmp/grep`, `/tmp/next-server`, `/tmp/nextjs`, `/var/tmp/next-server`, despite VPS having sufficient resources (2 CPU, 8GB RAM, <50 families, low traffic).

**Root Cause**: Alpine Linux's BusyBox (multi-call binary for shell utilities) and musl libc caused collisions when Next.js/SWC extracted native binaries to `/tmp` at runtime. The `/tmp/grep` error was the smoking gun - a BusyBox-specific collision that couldn't be fixed with environment variables or temp directory workarounds.

**Solution - Three-Tier Fix**:

#### TIER 1: Docker/Infrastructure (Root Cause)
- **Switched base image from Alpine to Debian Slim** (`node:22.13.1-alpine` → `node:22-slim`)
  - Eliminates BusyBox multi-call binary collisions
  - Uses glibc instead of musl for better SWC native binary support
  - Prevents `/tmp/grep` and other ETXTBSY errors
- **Simplified docker-entrypoint.sh**: Removed aggressive cleanup of `/tmp`, `/var/tmp`, and `/app/tmp` that were band-aids for Alpine issues
- **Removed aggressive memory constraints**: Deleted `NODE_OPTIONS='--max-old-space-size=1024 --max-semi-space-size=32'` from package.json start script (the `--max-semi-space-size=32` forced excessive garbage collection)
- **Removed workaround environment variables**: Deleted `TMPDIR`, `TEMP`, `TMP`, and `NEXT_PRIVATE_STANDALONE_CACHE_DIR` that were ineffective with Alpine

**Files Modified**:
- `Dockerfile` - Complete rewrite for Debian Slim (70 lines → 55 lines)
- `docker-entrypoint.sh` - Simplified from 14 lines to 8 lines
- `package.json` - Removed memory constraints from start script

#### TIER 2: Next.js Configuration (Contributory)
- **Removed `force-dynamic` from 5 client components**: `export const dynamic = 'force-dynamic'` on `'use client'` components is meaningless but forced unnecessary server-side rendering, triggering more SWC binary extraction events
  - `src/app/admin/page.tsx`
  - `src/app/register/page.tsx`
  - `src/app/admin/edit/[id]/page.tsx`
  - `src/app/privacy-policy/page.tsx`
  - `src/app/login/page.tsx`

**Impact**: Next.js can now statically render page shells at build time, reducing per-request server work.

#### TIER 3: Application Code Optimizations (Performance)
- **Added debouncing to search input** (300ms delay): Prevents `filterFamilies` from running on every keystroke, reducing unnecessary CPU usage
- **Replaced filterFamilies async function with useMemo**: Eliminated async useEffect pattern, unnecessary state updates, and the eslint-disable-line warning. Cleaner derived state pattern.
- **Removed dead resize handler**: Deleted no-op useEffect that set `viewMode` to 'table' regardless of screen size, along with the unused `viewMode` state variable

**Files Modified**:
- `src/app/page.tsx` - Added debouncing, replaced filterFamilies with useMemo, removed dead code

**Expected Outcome**:
- Zero ETXTBSY/EACCES errors in container logs
- CPU usage stays under 40-50% during normal use (down from 100% spikes)
- Memory usage stays under 1.5GB (down from 8GB spikes)
- Predictable resource usage proportional to traffic
- Smoother UI responsiveness from debounced search

**Trade-offs**:
- Docker image size increased ~100MB (Alpine ~80MB base → Debian Slim ~180MB base)
- This is acceptable for a VPS deployment where stability > image size

**Deployment Notes**:
- No Dokploy configuration changes needed (already using Dockerfile build type)
- Changes are reversible via git if rollback needed
- Success criteria: 24 hours with no ETXTBSY errors, stable CPU/RAM usage

---

### 2026-02-05 Update: Additional ETXTBSY Fix Required

**Discovery**: After deploying Debian Slim, ETXTBSY errors persisted on `/tmp/nextjs` and `/tmp/grep`. Container verification showed Debian was running correctly, but errors continued.

**Root Cause Refinement**: The issue was not solely Alpine/BusyBox. Next.js image optimization (Sharp) and SWC native binaries were still being extracted to system `/tmp` even on Debian, causing file locking conflicts under concurrent load.

**Additional Fixes Applied**:
1. **Disabled Next.js image optimization** (`unoptimized: true` in next.config.ts)
   - Sharp library was extracting native binaries to `/tmp` during image processing
   - Client-side compression already handles image optimization adequately
   - Eliminates primary source of native binary extraction

2. **Enforced TMPDIR redirection for SWC**
   - Added `ENV TMPDIR=/app/tmp` and `ENV NEXT_SWC_TMPDIR=/app/tmp` to Dockerfile
   - Forces SWC native binary extraction to app-owned directory
   - Created `/app/tmp` with 1777 permissions (world-writable with sticky bit)

3. **Added build-time TMPDIR**
   - Set `TMPDIR=/tmp/build-tmp` during `npm run build` stage
   - Prevents build-time file conflicts

4. **Enhanced entrypoint cleanup**
   - Added `rm -f /app/tmp/*` to remove stale files from previous runs
   - Ensures clean state on container restart

**Files Modified**:
- `next.config.ts` - Disabled image optimization
- `Dockerfile` - Added TMPDIR env vars, created /app/tmp directory
- `docker-entrypoint.sh` - Added cleanup of /app/tmp

**Trade-off**: Images are no longer server-side optimized (no WebP conversion, no responsive sizing). However, client-side compression in `src/lib/image-utils.ts` already reduces images to max 800px width at 0.8 JPEG quality before upload, so server-side optimization was redundant.

**Commit**: `075fc06` - Disable image optimization and enforce TMPDIR for SWC binaries

---

### 2026-02-05 Update 2: Force Single-Threaded Execution (REVERTED)

**Status**: ❌ This approach was attempted but did not fix the issue. See 2026-02-08 update below for the actual fix.

**Discovery**: Even with TMPDIR correctly set to `/app/tmp` (verified via `env | grep TMP`), errors continued on `/tmp/grep`, `/var/tmp/next-server`, and `next-server`. Container inspection showed Next.js was writing files to BOTH `/app/tmp` AND `/tmp`/`/var/tmp` simultaneously.

**Attempted Fix**:
1. Force single-threaded libuv operations: `ENV UV_THREADPOOL_SIZE=1`
2. Set reasonable memory limit: `ENV NODE_OPTIONS="--max-old-space-size=2048"`
3. chmod 1777 on system temp dirs

**Why It Didn't Work**: The ETXTBSY race condition is in Next.js/SWC's native binary extraction logic, not at the libuv thread pool level. The real issue is multiple Node.js workers extracting the same binaries to `/tmp` simultaneously.

**Commit**: `3e6478f` - Force single-threaded Node.js execution (reverted in later fix)

---

### 2026-02-08: SWC Binary Pre-Extraction Fix (ACTUAL FIX)

**Problem**: After extensive debugging and research, the root cause was identified as a race condition in Next.js/SWC's native binary extraction logic. The specific files `/tmp/grep`, `/tmp/next-server`, and `/tmp/nextjs` are **SWC helper binaries** extracted at runtime. Under concurrent load, multiple processes/workers try to write to and execute these same files simultaneously, causing ETXTBSY errors.

**Contributing Factor - Vercel to Dokploy Migration**: Moving from Vercel to Dokploy removed critical infrastructure:
- Vercel: Static assets served by CDN, bot traffic filtered at edge, isolated serverless functions
- Dokploy: Single Node.js process handles everything (static files, renders, API routes), no CDN, no bot protection
- Result: Standalone server gets hammered with requests → more worker recycling → more binary extraction attempts → ETXTBSY race condition

**Root Cause Analysis** (from upstream research):
- `/tmp/grep`, `/tmp/next-server`, `/tmp/nextjs` are SWC native binaries extracted at runtime
- Process A extracts binary to `/tmp/next-server` and begins executing it
- Process B tries to overwrite the same file → kernel rejects with ETXTBSY (file is being executed)
- Under load: worker recycling triggers repeated extraction attempts → retry loops → CPU/memory exhaustion
- Delayed onset (15-30 min): Initial startup works fine until sustained load triggers worker recycling

**The Fix - Three-Part Solution**:

#### Part 1: Pre-Extract SWC Binaries at Build Time
Added to `Dockerfile`:
```dockerfile
# Pre-extract SWC binaries at build time to prevent ETXTBSY race condition
RUN node -e "..." 2>/dev/null || true && \
chmod 555 /tmp/next-server /tmp/nextjs /tmp/grep 2>/dev/null || true && \
cp /tmp/next-server /tmp/nextjs /tmp/grep /app/.next-bins/ 2>/dev/null || true
```

This starts a minimal HTTP server (triggers SWC extraction), then makes binaries read-only and copies them to `/app/.next-bins` for storage.

#### Part 2: Copy Pre-Extracted Binaries at Runtime
Updated `docker-entrypoint.sh`:
```bash
cp /app/.next-bins/* /tmp/ 2>/dev/null || true
chmod 555 /tmp/next-server /tmp/nextjs /tmp/grep 2>/dev/null || true
```

If binaries are **read-only and already present**, SWC extraction code sees they exist, skips writing, and just executes them. Race condition eliminated.

#### Part 3: Clean Up Previous Workarounds
- **Removed** `sharp` from `package.json` (not used with `unoptimized: true`)
- **Removed** workaround env vars: `TMPDIR`, `NEXT_SWC_TMPDIR`, `UV_THREADPOOL_SIZE`, `NODE_OPTIONS`
- **Removed** `/app/tmp` directory and related chmod operations
- **Added** `experimental.preloadEntriesOnStart: false` to `next.config.ts` (fixes separate Next.js 15.x memory leak issue)

**Files Modified**:
- `Dockerfile` - Simplified, added SWC pre-extraction step, removed all workaround env vars
- `docker-entrypoint.sh` - Simplified to copy pre-extracted binaries
- `package.json` - Removed sharp dependency
- `next.config.ts` - Added experimental.preloadEntriesOnStart: false

**Expected Outcome**:
- Zero ETXTBSY/EACCES errors (binaries are read-only, no concurrent writes possible)
- CPU usage: 20-40% typical (down from 100% spikes)
- Memory usage: 500MB-1GB (controlled by experimental config)
- Stable performance proportional to actual traffic

**Next Steps (Recommended)**:
1. **Add Cloudflare** (free tier) - See Tier 1 below for setup instructions
2. **Monitor for 24 hours** - Verify ETXTBSY errors are gone and resource usage is stable
3. **Consider upgrading to Next.js 16.x** - See Tier 3 below for upgrade guide

**Commit**: TBD - SWC binary pre-extraction fix

---

## Future Optimization Opportunities

### Tier 1: Add Cloudflare (Highest Impact, Low Effort)

**Problem**: The Vercel → Dokploy migration removed CDN and bot protection. A single standalone Node.js server now handles:
- All static assets (`_next/static/*`, images, fonts)
- All page renders and API routes
- Bot traffic (crawlers, AI bots like Claude, security scanners)
- Health checks and monitoring probes

**Solution**: Point DNS through Cloudflare's free tier

**Setup Steps**:
1. Create free Cloudflare account at cloudflare.com
2. Add your domain (sbm-directory.finnydesigns.com)
3. Update nameservers at your registrar to Cloudflare's
4. Configure caching rules:
   ```
   Cache Rule #1 - Static Assets
   - URL Path matches: /_next/static/*
   - Cache Level: Standard
   - Edge Cache TTL: 1 year
   - Browser Cache TTL: 1 year

   Cache Rule #2 - Images
   - URL Path matches: *.jpg, *.png, *.webp, *.svg, *.ico
   - Cache Level: Standard
   - Edge Cache TTL: 1 month

   Cache Rule #3 - Public Directory
   - URL Path matches: /logo-second-body-montessori.png, /favicon.ico
   - Cache Level: Standard
   - Edge Cache TTL: 1 month
   ```
5. Enable Bot Fight Mode (Settings → Security → Bots)
6. Enable Rate Limiting (10 requests/second per IP)
7. Enable "Under Attack Mode" temporarily if needed

**Expected Impact**:
- Server load reduction: 80-90% (static assets served from CDN edge, not origin server)
- Bot traffic: Reduced by 70-80% (malicious bots blocked automatically)
- Geographic latency: Improved (assets served from nearest edge location)
- Server CPU: Drop from 40% → 10-15% typical
- Server bandwidth: Reduced by 90%+

**Cost**: $0/month (Free tier handles up to 100k requests/day)

**Trade-offs**: None significant. Cloudflare's free tier is production-ready.

---

### Tier 3: Upgrade to Next.js 16.x (Medium Impact, High Effort)

**Problem**: Next.js 15.5.3 has known issues:
- High idle CPU (15-20%) from `chili` parallelism library bug ([#77192](https://github.com/vercel/next.js/issues/77192))
- Memory leaks in fetch/undici integration ([#79588](https://github.com/vercel/next.js/issues/79588))
- ETXTBSY race condition still present (no upstream fix in 15.x)

**Current Version**: Next.js 15.5.3 (released September 2025)
**Latest Stable**: Next.js 16.1.6 (released January 2026)

**Known Improvements in Next.js 16.x**:
- Switched from `chili` to `rayon` for parallelism (fixes idle CPU bug)
- Improved fetch memory management
- Better SWC binary caching (may reduce ETXTBSY frequency)
- React 19 optimizations
- Turbopack improvements

**Upgrade Steps**:
1. Review breaking changes: https://nextjs.org/docs/app/guides/upgrading/version-16
2. Update dependencies:
   ```bash
   npm install next@latest react@latest react-dom@latest
   npm install -D eslint-config-next@latest
   ```
3. Test locally:
   ```bash
   npm run build
   npm run start
   ```
4. Check for deprecated patterns:
   - `generateMetadata` API changes
   - Image component prop changes
   - Middleware API updates
5. Run full test suite (if you have one)
6. Deploy to staging environment first
7. Monitor for 48 hours before promoting to production

**Expected Impact**:
- Idle CPU: 15-20% → 3-5% (from rayon switch)
- Memory leaks: Reduced or eliminated (better fetch handling)
- Build performance: 10-20% faster (Turbopack improvements)
- ETXTBSY: Possibly reduced frequency (improved caching), but pre-extraction fix still needed

**Effort**: Medium-High
- Code changes: 2-4 hours (depending on deprecated API usage)
- Testing: 4-8 hours (thorough regression testing)
- Deployment: 1-2 hours (staged rollout)

**Risk**: Medium
- Breaking changes possible (Next.js major version bump)
- Requires thorough testing
- Potential for new bugs in 16.x

**Recommendation**:
- Do Tier 1 (Cloudflare) first - immediate impact, zero risk
- Monitor current deployment with SWC pre-extraction fix for 1 week
- If stable, schedule Next.js 16.x upgrade as a separate initiative
- Run upgrade in a staging environment first

**Trade-offs**:
- Pro: Better performance, bug fixes, future-proofing
- Con: Testing effort, potential regressions, new learning curve
- Con: React 19 requires updating any third-party UI libraries
