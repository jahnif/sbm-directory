# Deployment Guide - Memory & CPU Optimization

## Fixed Issues (2026-01-29)

### 1. CRITICAL Memory Leak - URL.createObjectURL ✅
**File:** [src/lib/image-utils.ts](src/lib/image-utils.ts)
- **Problem:** Every image upload leaked memory by not revoking object URLs
- **Impact:** 3-5GB RAM usage from accumulated blob references
- **Fix:** Added `URL.revokeObjectURL()` cleanup after image compression

### 2. Sequential Proximity Search CPU Spike ✅
**File:** [src/app/page.tsx](src/app/page.tsx)
- **Problem:** Made hundreds of sequential API calls for postal code lookups
- **Impact:** 100%+ CPU usage during proximity filtering
- **Fix:** Implemented in-memory postal code cache with Map for O(1) lookups

### 3. Supabase Client Recreation ✅
**Files:**
- [src/app/api/postal-code-coordinates/route.ts](src/app/api/postal-code-coordinates/route.ts)
- [src/app/api/postal-codes/route.ts](src/app/api/postal-codes/route.ts)
- [src/lib/supabase-server.ts](src/lib/supabase-server.ts) (new)

- **Problem:** New Supabase client created on every API request
- **Impact:** Connection overhead, memory accumulation
- **Fix:** Created singleton cached server-side Supabase client

### 4. Node.js Memory Limits ✅
**File:** [package.json](package.json)
- **Problem:** No memory constraints for Node process
- **Fix:** Added `--max-old-space-size=1024` and `--max-semi-space-size=32` flags

### 5. Next.js Production Config ✅
**File:** [next.config.ts](next.config.ts)
- Added production optimizations:
  - Disabled source maps (saves memory)
  - Limited concurrent page compilations (2 pages max)
  - Enabled compression
  - Optimized package imports

---

## Fixing ETXTBSY Errors

### Root Causes
The `ETXTBSY: text file is busy` errors occur when:
1. Build process hasn't completed before starting the app
2. Sharp native bindings are still compiling
3. Multiple processes access `.next` cache simultaneously

### Dokploy-Specific Fixes

#### Option 1: Add Dockerfile (Recommended)
Create `Dockerfile` in project root:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies for Sharp
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Build application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Then update `next.config.ts`:**
```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // Add this for Docker
  // ... rest of config
}
```

#### Option 2: Update Dokploy Build Commands
If not using Dockerfile, configure in Dokploy dashboard:

**Build Command:**
```bash
npm ci && npm run build
```

**Start Command:**
```bash
npm run start
```

**Environment Variables:**
```env
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=32
NEXT_TELEMETRY_DISABLED=1
```

#### Option 3: Add Health Check Delay
In Dokploy, add a startup delay to ensure build completes:

**Health Check Settings:**
- Initial delay: 30 seconds
- Health check endpoint: `/api/postal-codes`
- Timeout: 5 seconds
- Retries: 3

---

## Additional Recommendations

### 1. Implement Pagination (Not Yet Done)
The home page still loads ALL families/adults/children at once. For 100+ families:

**Suggested Implementation:**
```typescript
// src/app/page.tsx
const [page, setPage] = useState(1)
const ITEMS_PER_PAGE = 50

const loadFamilies = async () => {
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const { data: familiesData } = await supabase
    .from('families')
    .select('*')
    .order('family_name')
    .range(from, to)

  // Fetch only adults/children for these families
  const familyIds = familiesData.map(f => f.id)
  const { data: adultsData } = await supabase
    .from('adults')
    .select('*')
    .in('family_id', familyIds)

  const { data: childrenData } = await supabase
    .from('children')
    .select('*')
    .in('family_id', familyIds)

  // ... map together
}
```

### 2. Add Request Rate Limiting
**File:** `src/app/api/translate/route.ts`
```typescript
// Add rate limiting to prevent translation API abuse
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})
```

### 3. Add Monitoring
Install Sentry for production monitoring:
```bash
npm install @sentry/nextjs
```

Then run:
```bash
npx @sentry/wizard@latest -i nextjs
```

### 4. Database Indexing
Ensure these Supabase indexes exist:
```sql
-- For faster family lookups
CREATE INDEX idx_families_family_name ON families(family_name);

-- For faster adult/child family lookups
CREATE INDEX idx_adults_family_id ON adults(family_id);
CREATE INDEX idx_children_family_id ON children(family_id);

-- For postal code lookups
CREATE INDEX idx_codigos_postales_codigo ON codigos_postales(codigo_postal);
```

---

## Performance Metrics Expected

### Before Fixes
- Memory usage: 3-5 GB
- CPU usage: 100%+
- Proximity search: ~100 sequential API calls
- Page load: 5-10 seconds with 100 families

### After Fixes
- Memory usage: 500MB - 1GB (controlled)
- CPU usage: 20-40% typical
- Proximity search: 1 API call at startup, then O(1) lookups
- Page load: 2-3 seconds (still needs pagination for large datasets)

---

## Monitoring Commands

### Check Memory Usage
```bash
# In Dokploy container
ps aux | grep node

# Or use top
top -p $(pgrep -f 'node.*next')
```

### Check for ETXTBSY errors
```bash
# View container logs
dokploy logs <service-name>

# Or in container
journalctl -u <service-name> | grep ETXTBSY
```

### Test API Response Times
```bash
# Postal code coordinates endpoint
time curl "https://your-domain.com/api/postal-code-coordinates?codigo_postal=46001"

# Should respond in < 50ms after caching
```

---

## Rollback Instructions

If issues occur after deployment:

1. **Revert code changes:**
   ```bash
   git revert HEAD~5..HEAD
   git push
   ```

2. **Clear Next.js cache in Dokploy:**
   ```bash
   rm -rf .next/cache
   npm run build
   ```

3. **Restart with increased memory:**
   ```bash
   NODE_OPTIONS='--max-old-space-size=2048' npm start
   ```

---

## Support

For issues:
- Check Dokploy logs: `dokploy logs <service-name>`
- Review Next.js build output for errors
- Verify environment variables are set correctly
- Ensure Sharp compiled successfully: `npm list sharp`
