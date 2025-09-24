# SBM Montessori School Family Directory

A Next.js web application that serves as an online yearbook and directory for parents at a Montessori school. This platform allows families to connect, share professional information, and find other families within their children's classes.

## Features

- **Universal Password Protection**: Simple shared password access for all users
- **Family Registration**: Easy-to-use form for adding family information
- **Responsive Directory Display**:
  - Desktop: Tabular view with circular profile photos and expandable descriptions
  - Mobile: Card-based layout for better mobile experience
- **Advanced Search & Filtering**:
  - Search by family names, adult names, descriptions
  - Filter by children's classes (Pegasus, Orion, Andromeda)
  - Filter for families interested in professional connections
- **Image Management**: Automatic image compression and optimization
- **Admin Interface**: CRUD operations for managing family entries
- **Professional Networking**: Option for families to indicate interest in professional connections

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with universal password
- **Image Storage**: Supabase Storage
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd sbm-yearbook
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
NEXT_PUBLIC_SITE_PASSWORD=your_chosen_password
```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL commands from `migrations/000_supabase-setup.sql` in your Supabase SQL editor
   - This will create the necessary tables, policies, and storage bucket

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Code Formatting

This project uses Prettier for code formatting to maintain consistent code style across the codebase.

### Available Scripts

- `npm run format` - Format all files in the project
- `npm run format:check` - Check if files are properly formatted (useful for CI/CD)

### Configuration

Prettier is configured via `.prettierrc` with the following settings:

- Semi-colons: enabled
- Trailing commas: all
- Single quotes: disabled (uses double quotes)
- Print width: 80 characters
- Tab width: 2 spaces
- Use tabs: disabled (uses spaces)

## Database Schema

### Tables

- **families**: Stores family information and descriptions
- **adults**: Stores adult family member details, professional info, and networking preferences
- **children**: Stores children's names, photos, and class assignments

### Classes

The system supports three Montessori classes:

- Pegasus
- Orion
- Andromeda
- Lynx

## Usage

### For Parents

1. Visit the site and enter the shared password
2. Click "Add Your Family" to register
3. Fill out the form with your family information:
   - Family name and description
   - Adult information (names, photos, job details)
   - Children information (names, photos, classes)
   - Optional: Indicate interest in professional connections
4. Submit the form to add your family to the directory

### For Administrators

1. Access the admin panel via the "Admin" button
2. View all families in a table format
3. Edit existing families by clicking "Edit"
4. Delete families with confirmation (click "Delete" twice)

### Directory Features

- **Search**: Type to search across all family information
- **Class Filter**: Filter families by children's classes
- **Connections Filter**: Show only families interested in professional networking
- **Responsive Design**: Automatically switches between table and card views based on screen size

## Deployment

The application is configured for easy deployment on Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Add the environment variables in Vercel's dashboard
4. Deploy!

## Security Features

- Row Level Security (RLS) enabled on all database tables
- Image upload validation and compression
- Universal password protection with secure cookie storage
- Protected API routes and middleware

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and intended for use by the Montessori school community only.
