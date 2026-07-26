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

export function getMapUrlFromItem(item: ItemOrario, currentCity?: string, countryContext?: Paese): string {
  const query = item.maps_query || item.luogo_nome || item.attivita;
  return getMapDeepLink(query, currentCity, item.maps_provider, countryContext);
}

export interface FlightTrackingUrls {
  flightAware: string;
  tripCom: string;
  flightradar24: string;
}

/**
 * Generates tracking URLs for a flight given IATA flight number and optional ICAO flight code
 */
export function getFlightTrackingUrls(numeroVolo: string, codiceIcao?: string): FlightTrackingUrls {
  // Normalize IATA flight code: "CA 940" -> "ca940"
  const iataClean = numeroVolo.replace(/\s+/g, '').toLowerCase();

  // If ICAO code is provided use it (e.g. "CCA940"), otherwise fallback to uppercase IATA clean ("CA940")
  const icaoClean = (codiceIcao || numeroVolo).replace(/\s+/g, '').toUpperCase();

  return {
    flightAware: `https://www.flightaware.com/live/flight/${icaoClean}`,
    tripCom: `https://it.trip.com/flights/status-${iataClean}`,
    flightradar24: `https://www.flightradar24.com/data/flights/${iataClean}`
  };
}


