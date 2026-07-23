import type { ViaggioData, DailyJournal, CheckIn } from '../types/viaggio';
import { formatDate } from './dateUtils';
import { generateGeoJSON, generateKML } from './geoUtils';
import { getCheckInPhotos } from '../store/db';
import { blobToDataURL } from './photoUtils';

/**
 * Copies text to system clipboard using navigator.clipboard with fallback to document.execCommand('copy')
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard failed, using fallback:', err);
    }
  }

  // Fallback using textarea + execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return successful;
  } catch (err) {
    console.error('execCommand copy failed:', err);
    return false;
  }
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getCheckInsForDay(
  checkInsParam: CheckIn[] | Record<string, CheckIn> | Record<string, any> | undefined,
  giornoNum: number
): CheckIn[] {
  if (!checkInsParam) return [];
  const list: CheckIn[] = Array.isArray(checkInsParam)
    ? checkInsParam
    : Object.values(checkInsParam);

  return list
    .filter((c) => c && typeof c === 'object' && c.giorno === giornoNum && c.id)
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

/**
 * Generates formatted Markdown for a single day including itinerary, nightly notes/journal, and check-ins.
 */
export function generateDayMarkdown(
  giornoNum: number,
  data: ViaggioData,
  journals: Record<number, DailyJournal>,
  checkIns?: CheckIn[] | Record<string, CheckIn> | Record<string, any>
): string {
  const giorno = data.itinerario.find((g) => g.giorno === giornoNum);
  if (!giorno) return '';

  const journal = journals[giornoNum];
  const dayCheckIns = getCheckInsForDay(checkIns, giornoNum);
  const lines: string[] = [];

  lines.push(`## Giorno ${giorno.giorno} - ${giorno.titolo} (${formatDate(giorno.data)})`);
  lines.push(`**Città / Fase**: ${giorno.citta} - ${giorno.fase}`);
  if (giorno.focus) lines.push(`**Focus**: ${giorno.focus}`);
  if (giorno.vibe) lines.push(`**Vibe**: ${giorno.vibe}`);
  if (giorno.focus_culinario) lines.push(`**Focus Culinario**: ${giorno.focus_culinario}`);
  lines.push('');

  // Daily Journal / Nightly Notes
  if (journal) {
    lines.push('### 🌙 Diario di Bordo Serale');
    if (journal.rating) {
      const stars = '⭐'.repeat(journal.rating);
      lines.push(`- **Valutazione**: ${stars} (${journal.rating}/5)`);
    }
    if (journal.highlight) {
      lines.push(`- **Momento Highlight**: ${journal.highlight}`);
    }
    if (journal.notes) {
      lines.push(`- **Note Serali**: ${journal.notes}`);
    }
    lines.push('');
  }

  // Schedule (No 1-tap reactions)
  if (giorno.tabella_oraria && giorno.tabella_oraria.length > 0) {
    lines.push('### ⏰ Programma del Giorno');
    giorno.tabella_oraria.forEach((item) => {
      let line = `- **${item.ora}** [${item.tipo.toUpperCase()}] ${item.attivita}`;
      if (item.dettagli) line += ` - *${item.dettagli}*`;
      lines.push(line);
    });
    lines.push('');
  }

  // Check-ins for the day
  if (dayCheckIns.length > 0) {
    lines.push('### 📍 Check-in Registrati');
    dayCheckIns.forEach((c) => {
      const name = c.luogo_nome || c.locationName || 'Luogo';
      const ratingStr = c.rating ? ` ⭐ ${c.rating}/5` : '';
      lines.push(`- **📍 Check-in: ${name}**${ratingStr}`);

      if (c.timestamp) {
        const timeStr = formatTime(c.timestamp);
        if (timeStr) {
          lines.push(`  - **Ora**: ${timeStr}`);
        }
      }

      const comment = c.commento || c.comment;
      if (comment) {
        lines.push(`  > ${comment}`);
      }

      const lat = c.coords?.lat ?? c.lat;
      const lng = c.coords?.lng ?? c.lng;
      if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
        lines.push(`  - **Coordinate**: [${lat}, ${lng}](https://maps.google.com/?q=${lat},${lng})`);
      } else {
        lines.push(`  - **Coordinate**: Posizione GPS non registrata`);
      }

      const photoCount = (c.photoIds || c.photos || []).length;
      if (photoCount > 0) {
        lines.push(`  - **Foto**: ${photoCount} foto allegat${photoCount === 1 ? 'a' : 'e'}`);
      }
    });
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generates complete formatted Markdown for the entire travel journal.
 */
export function generateFullJournalMarkdown(
  data: ViaggioData,
  journals: Record<number, DailyJournal>,
  checkIns?: CheckIn[] | Record<string, CheckIn> | Record<string, any>
): string {
  const lines: string[] = [];

  lines.push(`# 📓 ${data.meta.titolo}`);
  lines.push(`*Passeggeri: ${data.meta.passeggeri.join(', ')}*`);
  lines.push(`*Versione: ${data.meta.versione}*`);
  lines.push('\n---\n');

  data.itinerario.forEach((giorno) => {
    const dayMd = generateDayMarkdown(giorno.giorno, data, journals, checkIns);
    lines.push(dayMd);
    lines.push('---\n');
  });

  return lines.join('\n');
}

/**
 * Exports check-ins to GeoJSON format and triggers file download.
 */
export function exportCheckInsGeoJSON(
  checkIns: CheckIn[] | Record<string, CheckIn>,
  itinerario?: Array<{ giorno: number; citta: string }>
): void {
  const geojsonStr = generateGeoJSON(checkIns, itinerario);
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(geojsonStr);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `trip-checkins-${Date.now()}.geojson`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Exports check-ins to KML format and triggers file download.
 */
export function exportCheckInsKML(
  checkIns: CheckIn[] | Record<string, CheckIn>,
  itinerario?: Array<{ giorno: number; citta: string }>
): void {
  const kmlContent = generateKML(checkIns, itinerario);
  const dataStr = 'data:application/vnd.google-earth.kml+xml;charset=utf-8,' + encodeURIComponent(kmlContent);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `trip-checkins-${Date.now()}.kml`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Exports full travel backup JSON including metadata, daily journals, check-ins, and resolved base64 check-in photos.
 */
export async function exportFullBackupJSON(
  data: ViaggioData,
  journals: Record<number, DailyJournal>,
  checkIns: CheckIn[] | Record<string, CheckIn>
): Promise<void> {
  const checkInsList = Array.isArray(checkIns) ? checkIns : Object.values(checkIns || {});

  const photoMap: Record<string, string> = {};
  try {
    const dbPhotos = await getCheckInPhotos();
    for (const photo of dbPhotos) {
      if (photo.blob) {
        photoMap[photo.id] = await blobToDataURL(photo.blob);
      }
    }
  } catch (err) {
    console.warn('Could not read photos from IndexedDB:', err);
  }

  const exportObject = {
    meta: data.meta,
    exportDate: new Date().toISOString(),
    journals,
    checkIns: checkInsList,
    checkInPhotos: photoMap,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `diario-di-viaggio-2026-${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
