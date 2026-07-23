import type { CheckIn } from '../types/viaggio';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getCheckInList(checkins: CheckIn[] | Record<string, CheckIn>): CheckIn[] {
  if (Array.isArray(checkins)) return checkins;
  if (checkins && typeof checkins === 'object') return Object.values(checkins);
  return [];
}

export const CITY_FALLBACKS: Record<string, [number, number]> = {
  seoul: [126.9780, 37.5665],
  tokyo: [139.6503, 35.6762],
  kyoto: [135.7681, 35.0116],
  osaka: [135.5023, 34.6937],
  kanazawa: [136.6562, 36.5613],
  takayama: [137.2513, 36.1408],
  gujo: [136.9602, 35.7485],
  hakone: [139.1069, 35.2323],
  nara: [135.8050, 34.6851],
  hiroshima: [132.4553, 34.3963],
};

export function getCheckInCoordinates(
  c: CheckIn,
  itinerario?: Array<{ giorno: number; citta: string }>
): { coords: [number, number]; isEstimated: boolean; cityUsed?: string } {
  const lat = c.coords?.lat ?? c.lat;
  const lng = c.coords?.lng ?? c.lng;

  // 1. Direct valid GPS coordinates
  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
    return { coords: [lng, lat], isEstimated: false };
  }

  // 2. Check if location name contains a known city name
  const locName = (c.luogo_nome || c.locationName || '').toLowerCase();
  for (const [city, fallback] of Object.entries(CITY_FALLBACKS)) {
    if (locName.includes(city)) {
      return { coords: fallback, isEstimated: true, cityUsed: city };
    }
  }

  // 3. Fallback to the city of the trip day (itinerario)
  if (itinerario && Array.isArray(itinerario)) {
    const dayObj = itinerario.find((g) => g.giorno === c.giorno);
    if (dayObj && dayObj.citta) {
      const dayCity = dayObj.citta.toLowerCase();
      for (const [city, fallback] of Object.entries(CITY_FALLBACKS)) {
        if (dayCity.includes(city)) {
          return { coords: fallback, isEstimated: true, cityUsed: dayObj.citta };
        }
      }
    }
  }

  // 4. Default Tokyo fallback if no city matched
  return { coords: CITY_FALLBACKS['tokyo'], isEstimated: true, cityUsed: 'Tokyo (Default)' };
}

export function generateGeoJSON(
  checkins: CheckIn[] | Record<string, CheckIn>,
  itinerario?: Array<{ giorno: number; citta: string }>
): string {
  const list = getCheckInList(checkins);

  const features = list.map((c) => {
    const { coords: [lng, lat], isEstimated, cityUsed } = getCheckInCoordinates(c, itinerario);
    const name = c.luogo_nome || c.locationName || 'Check-in';
    const comment = c.commento || c.comment || '';
    const photoCount = c.photoIds ? c.photoIds.length : c.photos ? c.photos.length : 0;
    const itemId = c.item_id || c.scheduleItemId || null;

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [lng, lat],
      },
      properties: {
        id: c.id,
        giorno: c.giorno,
        luogo_nome: name,
        locationName: name,
        commento: comment,
        comment,
        rating: c.rating ?? null,
        timestamp: c.timestamp,
        formatted_date: new Date(c.timestamp).toISOString(),
        item_id: itemId,
        scheduleItemId: itemId,
        photoCount,
        photosCount: photoCount,
        gps_estimated: isEstimated,
        ...(isEstimated ? { gps_missing: true, city_fallback: cityUsed } : {}),
      },
    };
  });

  const geojson = {
    type: 'FeatureCollection',
    features,
  };

  return JSON.stringify(geojson, null, 2);
}

export function generateKML(
  checkins: CheckIn[] | Record<string, CheckIn>,
  itinerario?: Array<{ giorno: number; citta: string }>
): string {
  const list = getCheckInList(checkins);

  const placemarks = list
    .map((c) => {
      const { coords: [lng, lat], isEstimated, cityUsed } = getCheckInCoordinates(c, itinerario);
      const name = escapeXml(c.luogo_nome || c.locationName || 'Check-in');
      const comment = c.commento || c.comment;

      const descParts = [
        `Giorno ${c.giorno}`,
        comment ? `Commento: ${comment}` : '',
        c.rating ? `Rating: ${c.rating}/5` : '',
        `Data: ${new Date(c.timestamp).toLocaleString()}`,
        isEstimated ? `(Posizione stimata per la città ${cityUsed || ''})` : '',
      ].filter(Boolean);

      const description = escapeXml(descParts.join('\n'));

      return `    <Placemark>
      <name>${name}</name>
      <description>${description}</description>
      <Point>
        <coordinates>${lng},${lat},0</coordinates>
      </Point>
    </Placemark>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Check-in Viaggio</name>
    <description>Check-in registrati durante il viaggio</description>
${placemarks}
  </Document>
</kml>`;
}
