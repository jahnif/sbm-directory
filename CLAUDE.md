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
