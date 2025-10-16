#!/usr/bin/env node

/**
 * Fetch precise coordinates for Valencia postal codes using Nominatim API
 *
 * This script:
 * 1. Reads unique postal codes from the CSV
 * 2. Queries Nominatim API for each postal code
 * 3. Respects rate limit (1 request per second)
 * 4. Outputs a new CSV with precise coordinates
 *
 * Usage: node scripts/fetch-postal-coordinates.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_CSV = path.join(__dirname, '../migrations/valencia_postal_codes_with_header_fixed.csv');
const OUTPUT_CSV = path.join(__dirname, '../migrations/valencia_postal_codes_precise.csv');
const RATE_LIMIT_MS = 1100; // 1.1 seconds between requests (slightly over 1 sec for safety)

// Parse CSV and get unique postal codes
function getUniquePostalCodes(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n').slice(1); // Skip header

  const postalCodes = new Map();

  lines.forEach(line => {
    // Parse CSV line (handle quoted fields)
    const match = line.match(/^([^,]+),"([^"]+)",([^,]+),([^,]+)$/);
    if (!match) {
      console.warn('Could not parse line:', line);
      return;
    }

    const [, codigo, localidad, lat, lon] = match;

    // Keep first occurrence of each postal code
    if (!postalCodes.has(codigo)) {
      postalCodes.set(codigo, { codigo, localidad, lat, lon });
    }
  });

  return Array.from(postalCodes.values());
}

// Fetch coordinates from Nominatim API
async function fetchCoordinates(codigoPostal) {
  const url = `https://nominatim.openstreetmap.org/search?postalcode=${codigoPostal}&country=Spain&format=json`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SBM-Directory/1.0 (School Family Directory)'
      }
    });

    if (!response.ok) {
      console.error(`HTTP error for ${codigoPostal}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      // Nominatim returns results sorted by relevance
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }

    console.warn(`No results found for postal code: ${codigoPostal}`);
    return null;

  } catch (error) {
    console.error(`Error fetching ${codigoPostal}:`, error.message);
    return null;
  }
}

// Sleep function for rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
  console.log('Reading unique postal codes...');
  const uniqueCodes = getUniquePostalCodes(INPUT_CSV);
  console.log(`Found ${uniqueCodes.length} unique postal codes\n`);

  console.log('Fetching coordinates from Nominatim...');
  console.log('This will take approximately', Math.ceil(uniqueCodes.length * RATE_LIMIT_MS / 1000 / 60), 'minutes\n');

  const results = [];

  for (let i = 0; i < uniqueCodes.length; i++) {
    const { codigo, localidad } = uniqueCodes[i];

    process.stdout.write(`[${i + 1}/${uniqueCodes.length}] Fetching ${codigo} (${localidad})... `);

    const coords = await fetchCoordinates(codigo);

    if (coords) {
      results.push({
        codigo_postal: codigo,
        localidad: localidad,
        latitud: coords.lat,
        longitud: coords.lon
      });
      console.log(`✓ ${coords.lat}, ${coords.lon}`);
    } else {
      // Fallback to original coordinates if API fails
      const original = uniqueCodes[i];
      results.push({
        codigo_postal: codigo,
        localidad: localidad,
        latitud: parseFloat(original.lat),
        longitud: parseFloat(original.lon)
      });
      console.log('✗ Using original coordinates');
    }

    // Rate limiting
    if (i < uniqueCodes.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  // Write CSV with header
  console.log('\nWriting results to CSV...');
  const csvLines = [
    'codigo_postal,localidad,latitud,longitud',
    ...results.map(r => `${r.codigo_postal},"${r.localidad}",${r.latitud},${r.longitud}`)
  ];

  fs.writeFileSync(OUTPUT_CSV, csvLines.join('\n'));

  console.log(`\n✅ Done! Wrote ${results.length} postal codes to:`);
  console.log(OUTPUT_CSV);
  console.log('\nYou can now import this file into Supabase!');
}

// Run script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
