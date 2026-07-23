import type { Volo, Treno, Bus } from '../types/viaggio';

/**
 * Strict real-time check: returns true ONLY if current date matches transit date
 * AND current time is within [ora_partenza, ora_arrivo].
 */
export function isTransitActiveNow(
  transit: Volo | Treno | Bus,
  nowDate: Date = new Date()
): boolean {
  if (!transit || !transit.data || !transit.ora_partenza || !transit.ora_arrivo) {
    return false;
  }

  // 1. Format dates as YYYY-MM-DD
  const year = nowDate.getFullYear();
  const month = String(nowDate.getMonth() + 1).padStart(2, '0');
  const day = String(nowDate.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  if (transit.data !== todayStr) {
    return false;
  }

  // 2. Format current time as HH:MM
  const currentHours = String(nowDate.getHours()).padStart(2, '0');
  const currentMinutes = String(nowDate.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  // Clean time strings (e.g. "10:21", "12:30")
  const startStr = transit.ora_partenza.trim();
  const endStr = transit.ora_arrivo.trim();

  return currentTimeStr >= startStr && currentTimeStr <= endStr;
}

/**
 * Calculate progress percentage (0 to 100) based on current time within transit time range
 */
export function getTransitProgressPercent(
  transit: Volo | Treno | Bus,
  nowDate: Date = new Date()
): number {
  if (!isTransitActiveNow(transit, nowDate)) return 0;

  const [startH, startM] = transit.ora_partenza.split(':').map(Number);
  const [endH, endM] = transit.ora_arrivo.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const currentMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();

  const totalDuration = endMinutes - startMinutes;
  if (totalDuration <= 0) return 100;

  const elapsed = currentMinutes - startMinutes;
  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
}

/**
 * Calculate remaining ETA in minutes
 */
export function getTransitEtaMinutes(
  transit: Volo | Treno | Bus,
  nowDate: Date = new Date()
): number {
  if (!isTransitActiveNow(transit, nowDate)) return 0;

  const [endH, endM] = transit.ora_arrivo.split(':').map(Number);
  const endMinutes = endH * 60 + endM;
  const currentMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();

  return Math.max(0, endMinutes - currentMinutes);
}

/**
 * Parses route string, time range string, and duration into structured object for UI display
 */
export function parseTransitRoute(
  tratta: string,
  orario?: string,
  durata?: string
): { origin: string; destination: string; depTime: string; arrTime: string; duration: string } {
  const routeParts = (tratta || '').split(/→|->|-|—/).map((s) => s.trim());
  const origin = routeParts[0] || 'Partenza';
  const destination = routeParts[1] || routeParts[0] || 'Arrivo';

  const timeParts = (orario || '').split(/→|->|-|—/).map((s) => s.trim());
  const depTime = timeParts[0] || '--:--';
  const arrTime = timeParts[1] || '--:--';

  return {
    origin,
    destination,
    depTime,
    arrTime,
    duration: durata || '',
  };
}

