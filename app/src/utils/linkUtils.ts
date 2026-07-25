import type { ItemOrario, MapsProvider, Paese } from '../types/viaggio';

/**
 * Normalizes query string for map searches
 */
export function formatMapQuery(query?: string, city?: string, address?: string): string {
  const q = (query || '').replace(/\[.*?\]|\(.*?\)/g, '').trim();
  const a = (address || '').trim();
  const c = (city || '').trim();

  let result = q;
  if (a && !result.toLowerCase().includes(a.toLowerCase())) {
    result = result ? `${result}, ${a}` : a;
  }
  if (c && !result.toLowerCase().includes(c.toLowerCase())) {
    result = result ? `${result}, ${c}` : c;
  }

  return result;
}

/**
 * Returns deep link for map navigation using explicit provider or country context
 */
export function getMapDeepLink(
  query?: string,
  city?: string,
  explicitProvider?: MapsProvider,
  paese?: Paese,
  address?: string
): string {
  const fullQuery = formatMapQuery(query, city, address);

  if (!fullQuery) {
    return 'https://www.google.com/maps';
  }

  const isKorea = paese === 'KR' ||
    explicitProvider === 'naver' ||
    city?.toLowerCase().includes('seoul') ||
    city?.toLowerCase().includes('busan') ||
    fullQuery.toLowerCase().includes('seoul') ||
    fullQuery.toLowerCase().includes('busan') ||
    fullQuery.toLowerCase().includes('korea');

  if (isKorea) {
    return `https://map.naver.com/v5/search/${encodeURIComponent(fullQuery)}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`;
}

/**
 * Returns deep link directly from ItemOrario
 */
export function getMapUrlFromItem(item: ItemOrario, currentCity?: string, countryContext?: Paese): string {
  const query = item.maps_query || item.luogo_nome || item.attivita;
  return getMapDeepLink(query, currentCity, item.maps_provider, countryContext);
}
