# Translation & Networking Features

This document outlines the new translation and networking features added to the SBM Family Directory.

## Features Added

### 1. DeepL Translation Integration
- **Automatic Translation**: Family information is automatically translated between English and Spanish using DeepL's API
- **Language Detection**: The system detects the language of submitted content
- **Dual Storage**: Both original and translated versions are stored in the database
- **Language Toggle**: Users can switch between English and Spanish views using the header toggle

### 2. Contact Information & Networking
- **Email & WhatsApp Fields**: Adults can optionally provide email addresses and WhatsApp numbers
- **Privacy Controls**: Users must explicitly opt-in to share contact information for networking
- **Double Opt-in System**:
  - Users must check a box to allow their contact info to be visible
  - Other users must click "Show Contact Information" to view it
- **Direct Contact Links**: Email links open mail client, WhatsApp links open WhatsApp

### 3. Enhanced Privacy Policy
- Updated to cover translation services and contact data collection
- Explains DeepL data processing and GDPR compliance
- Details the double opt-in system for contact sharing

## Database Changes

Run the following SQL migration to add the new fields:

```sql
-- Add contact fields to adults table
ALTER TABLE adults
ADD COLUMN email VARCHAR(255),
ADD COLUMN whatsapp_number VARCHAR(50),
ADD COLUMN show_contact_in_networking BOOLEAN DEFAULT FALSE;

-- Add translation fields to families table
ALTER TABLE families
ADD COLUMN family_name_es VARCHAR(255),
ADD COLUMN description_es TEXT,
ADD COLUMN original_language VARCHAR(2) DEFAULT 'en';

-- Add translation fields to adults table
ALTER TABLE adults
ADD COLUMN name_es VARCHAR(255);

-- Add translation fields to children table
ALTER TABLE children
ADD COLUMN name_es VARCHAR(255);

-- Add missing country and city fields
ALTER TABLE adults
ADD COLUMN country VARCHAR(100),
ADD COLUMN city VARCHAR(100);
```

## Environment Variables

Add to your `.env.local`:

```
DEEPL_API_KEY=your_deepl_api_key
```

Get your DeepL API key from: https://www.deepl.com/account/summary

## API Endpoints

### POST /api/translate
Translates text using DeepL API.

**Request:**
```json
{
  "text": "Hello, world!",
  "source_lang": "en",
  "target_lang": "es"
}
```

**Response:**
```json
{
  "translated_text": "¡Hola, mundo!",
  "detected_source_lang": "en"
}
```

## Translation Workflow

1. **Form Submission**: User submits family information
2. **Language Detection**: System detects if content is in English or Spanish
3. **Translation**: Content is sent to DeepL for translation to the opposite language
4. **Storage**: Both original and translated versions are saved
5. **Display**: Users can toggle between languages to see either version

## Contact Sharing Workflow

1. **Registration**: User optionally provides email/WhatsApp and opts into sharing
2. **Directory View**: Family cards show networking badge if contact info is available
3. **Contact Reveal**: Other users click "Show Contact Information" to view details
4. **Direct Contact**: Users can click email/WhatsApp links to contact directly

## Technical Implementation

### Translation Service
- **Location**: `/src/lib/translation.ts`
- **Functions**: `translateText()`, `translateFamilyData()`, `detectLanguage()`
- **API Route**: `/src/app/api/translate/route.ts`

### Contact Components
- **Family Card**: Enhanced with contact visibility toggle
- **Registration Form**: Added contact fields and privacy checkboxes
- **Types**: Updated TypeScript interfaces

### Language Toggle
- **Component**: `/src/components/LanguageToggle.tsx`
- **Fixed**: Flag/language mismatch (now shows correct flags)
- **Integration**: Connected to translation display system

## Privacy & Compliance

- **GDPR Compliant**: Full disclosure in privacy policy
- **Explicit Consent**: Users must opt-in to contact sharing
- **DeepL Processing**: Documented in privacy policy with link to DeepL's policy
- **Data Retention**: Follows existing data retention policies
- **User Rights**: All GDPR rights apply to new data types

## Testing

To test the features:

1. **Set up DeepL API key** in environment variables
2. **Run database migration** to add new fields
3. **Register a new family** with contact information
4. **Toggle language** to see translation
5. **Test contact sharing** with networking toggle
6. **Verify privacy policy** updates