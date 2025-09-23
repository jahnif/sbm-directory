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
