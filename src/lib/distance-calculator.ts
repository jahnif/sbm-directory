import { PostalCode } from '@/types'

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in kilometers
}

/**
 * Get coordinates for a given postal code
 * @param codigoPostal 5-digit Spanish postal code
 * @returns Coordinates or null if not found
 */
export async function getPostalCodeCoordinates(
  codigoPostal: string
): Promise<{ latitud: number; longitud: number } | null> {
  try {
    // Use API route for server-side query with service role key
    // This bypasses RLS and ensures we can always access the postal codes table
    const response = await fetch(`/api/postal-code-coordinates?codigo_postal=${encodeURIComponent(codigoPostal)}`)

    if (!response.ok) {
      console.error(`Error fetching postal code coordinates: ${response.statusText}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (err) {
    console.error('Error fetching postal code coordinates:', err)
    return null
  }
}

/**
 * Calculate distance between two postal codes
 * @param codigoPostal1 First postal code
 * @param codigoPostal2 Second postal code
 * @returns Distance in kilometers or null if coordinates not found
 */
export async function calculatePostalCodeDistance(
  codigoPostal1: string,
  codigoPostal2: string
): Promise<number | null> {
  const [coords1, coords2] = await Promise.all([
    getPostalCodeCoordinates(codigoPostal1),
    getPostalCodeCoordinates(codigoPostal2),
  ])

  if (!coords1 || !coords2) {
    return null
  }

  return calculateDistance(
    coords1.latitud,
    coords1.longitud,
    coords2.latitud,
    coords2.longitud
  )
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted string like "~2.3 km"
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `~${Math.round(distance * 1000)} m`
  }
  return `~${distance.toFixed(1)} km`
}

/**
 * Validate Spanish postal code format (must be 5 digits starting with 46 for Valencia)
 * @param codigoPostal Postal code to validate
 * @returns True if valid Valencia postal code
 */
export function isValidValenciaPostalCode(codigoPostal: string): boolean {
  return /^46[0-9]{3}$/.test(codigoPostal)
}

/**
 * Get all postal codes from the database (for client-side calculations)
 * @returns Array of all postal codes with coordinates
 */
export async function getAllPostalCodes(): Promise<PostalCode[]> {
  try {
    const response = await fetch('/api/postal-codes')

    if (!response.ok) {
      console.error(`Error fetching postal codes: ${response.statusText}`)
      return []
    }

    const data = await response.json()
    return data || []
  } catch (err) {
    console.error('Error fetching all postal codes:', err)
    return []
  }
}
