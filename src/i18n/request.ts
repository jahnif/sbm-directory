import {getRequestConfig} from 'next-intl/server';
import {defaultLocale} from './config';
 
export default getRequestConfig(async () => {
  // Get locale from localStorage in the browser, or use default
  const locale = defaultLocale;
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});