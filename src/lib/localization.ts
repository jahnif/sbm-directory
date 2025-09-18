import { Family, Adult, Child } from '@/types';

export type Locale = 'en' | 'es';

/**
 * Get localized text based on current locale
 * Returns Spanish version if locale is 'es' and translation exists, otherwise returns original
 */
export function getLocalizedText(
  originalText: string,
  translatedText: string | null | undefined,
  locale: Locale
): string {
  if (locale === 'es' && translatedText) {
    return translatedText;
  }
  return originalText;
}

/**
 * Get localized family data based on current locale
 */
export function getLocalizedFamily(family: Family, locale: Locale): Family {
  return {
    ...family,
    family_name: getLocalizedText(family.family_name, family.family_name_es, locale),
    description: getLocalizedText(family.description, family.description_es, locale),
    adults: family.adults.map(adult => getLocalizedAdult(adult, locale)),
    children: family.children.map(child => getLocalizedChild(child, locale))
  };
}

/**
 * Get localized adult data based on current locale
 */
export function getLocalizedAdult(adult: Adult, locale: Locale): Adult {
  return {
    ...adult,
    name: getLocalizedText(adult.name, adult.name_es, locale)
  };
}

/**
 * Get localized child data based on current locale
 */
export function getLocalizedChild(child: Child, locale: Locale): Child {
  return {
    ...child,
    name: getLocalizedText(child.name, child.name_es, locale)
  };
}

/**
 * Check if an adult has contact information available for networking
 */
export function hasNetworkingContact(adult: Adult): boolean {
  return adult.show_contact_in_networking && (!!adult.email || !!adult.whatsapp_number);
}

/**
 * Get contact information for an adult if they have enabled networking contact sharing
 */
export function getNetworkingContact(adult: Adult): { email?: string; whatsapp_number?: string } | null {
  if (!hasNetworkingContact(adult)) {
    return null;
  }

  return {
    ...(adult.email && { email: adult.email }),
    ...(adult.whatsapp_number && { whatsapp_number: adult.whatsapp_number })
  };
}