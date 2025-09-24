'use client'

import { LocationInfo } from '@/types'

interface Country {
  code: string
  name: string
  flag: string
}

const COUNTRIES: Country[] = [
  // Africa
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬' },
  { code: 'CD', name: 'Congo (Democratic Republic)', flag: '🇨🇩' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },

  // Asia
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'KP', name: 'North Korea', flag: '🇰🇵' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },

  // Europe
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'XK', name: 'Kosovo', flag: '🇽🇰' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦' },

  // North America
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },

  // Oceania
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },

  // South America
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
].sort((a, b) => a.name.localeCompare(b.name))

interface LocationSelectorProps {
  locations: LocationInfo[]
  onChange: (locations: LocationInfo[]) => void
  className?: string
}

export default function LocationSelector({
  locations,
  onChange,
  className = '',
}: LocationSelectorProps) {
  const addLocation = () => {
    onChange([...locations, { country: '', city: '' }])
  }

  const removeLocation = (index: number) => {
    onChange(locations.filter((_, i) => i !== index))
  }

  const updateLocation = (index: number, field: keyof LocationInfo, value: string) => {
    const updated = locations.map((location, i) =>
      i === index ? { ...location, [field]: value } : location
    )
    onChange(updated)
  }

  return (
    <div className={className}>
      {locations.map((location, index) => (
        <div key={index} className="flex gap-2 items-start mb-3">
          <div className="flex-1">
            <select
              value={location.country}
              onChange={(e) => updateLocation(index, 'country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select country</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={location.city}
              onChange={(e) => updateLocation(index, 'city', e.target.value)}
              placeholder="Enter city"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => removeLocation(index)}
            className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addLocation}
        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
      >
        + Add Location
      </button>
    </div>
  )
}

// Helper functions for displaying locations
export function getLocationDisplay(locations: LocationInfo[] | null): string {
  if (!locations || locations.length === 0) return ''
  return locations
    .filter(loc => loc.country || loc.city)
    .map(location => {
      const country = COUNTRIES.find(c => c.code === location.country)
      const flag = country ? country.flag : ''
      const countryName = country ? country.name : ''
      const city = location.city

      // Build the display string
      if (countryName && city) {
        return `${flag} ${countryName}, ${city}`
      } else if (countryName) {
        return `${flag} ${countryName}`
      } else if (city) {
        return city
      }
      return ''
    })
    .filter(Boolean)
    .join(' | ')
}

export function getLocationCountryDisplay(locations: LocationInfo[] | null): string {
  if (!locations || locations.length === 0) return ''
  return locations
    .filter(loc => loc.country)
    .map(location => {
      const country = COUNTRIES.find(c => c.code === location.country)
      return country ? country.flag : ''
    })
    .join(' ')
}

export function getLocationNames(locations: LocationInfo[] | null): string {
  if (!locations || locations.length === 0) return ''
  return locations
    .filter(loc => loc.country || loc.city)
    .map(location => {
      const country = COUNTRIES.find(c => c.code === location.country)
      const countryName = country ? country.name : ''
      const parts = [countryName, location.city].filter(Boolean)
      return parts.join(', ')
    })
    .join('; ')
}