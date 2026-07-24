/**
 * gipsigoService.ts
 * Servizio di sincronizzazione offline-first dei check-in verso GiPSigo.
 *
 * Garanzie:
 * - I check-in sono salvati SEMPRE e COMUNQUE in IndexedDB locale.
 * - La sync verso GiPSigo è best-effort e non-bloccante.
 * - La deduplicazione è gestita lato server via `source_key` (= checkin.id).
 */

import type { CheckIn, GiPSigoConfig } from '../types/viaggio';
import { getPendingCheckIns, markCheckInsSynced, saveGiPSigoConfig, getGiPSigoConfig } from '../store/db';

const BATCH_SIZE = 500;

/** DTO inviato all'endpoint GiPSigo per ogni check-in */
interface GiPSigoCheckInPayload {
  source_key: string;
  timestamp: number;
  date: string;       // "YYYY-MM-DD"
  lat?: number;
  lng?: number;
  location_name?: string;
  comment?: string;
  rating?: number;
}

/** Risposta attesa dall'API GiPSigo */
interface GiPSigoApiResponse {
  ok: boolean;
  inserted: number;
  skipped: number;
  inserted_keys?: string[];
  errors?: string[];  // errori per-item dal server
}

/** Converte un CheckIn locale nel DTO per l'endpoint GiPSigo */
export function toGiPSigoPayload(c: CheckIn): GiPSigoCheckInPayload {
  const lat = c.lat ?? c.coords?.lat;
  const lng = c.lng ?? c.coords?.lng;
  const dateStr = new Date(c.timestamp).toISOString().split('T')[0];

  // Combina nome luogo, commento e nota in un unico campo comment
  const parts: string[] = [];
  if (c.luogo_nome || c.locationName) {
    parts.push(c.luogo_nome || c.locationName || '');
  }
  if (c.commento || c.comment) {
    parts.push(c.commento || c.comment || '');
  }

  return {
    source_key: c.id,
    timestamp: c.timestamp,
    date: dateStr,
    ...(lat !== undefined && { lat }),
    ...(lng !== undefined && { lng }),
    ...(parts.length > 0 && { location_name: parts[0], comment: parts.slice(1).join(' — ') }),
    ...(c.rating !== undefined && { rating: c.rating }),
  };
}

/**
 * Invia i check-in pendenti a GiPSigo in batch.
 * Restituisce il numero totale di check-in marcati come sincronizzati.
 */
export async function syncPendingCheckIns(
  config: GiPSigoConfig,
  onProgress?: (synced: number, total: number) => void,
): Promise<{ synced: number; errors: string[] }> {
  if (!config.enabled || !config.apiKey || !config.tripToken || !config.endpointUrl) {
    return { synced: 0, errors: ['GiPSigo non configurato'] };
  }

  const pending = await getPendingCheckIns();
  if (pending.length === 0) {
    return { synced: 0, errors: [] };
  }

  const errors: string[] = [];
  let totalSynced = 0;

  // Invia in batch da max 500 elementi
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    const payloads = batch.map(toGiPSigoPayload);

    try {
      const resp = await fetch(config.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: config.apiKey,
          trip_token: config.tripToken,
          checkins: payloads,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        errors.push(`HTTP ${resp.status}: ${text.slice(0, 200)}`);
        continue;
      }

      const json: GiPSigoApiResponse = await resp.json();

      if (json.ok) {
        // Propaga eventuali errori per-item dal server
        if (json.errors?.length) {
          for (const e of json.errors) errors.push(e);
        }

        // Se il server restituisce inserted_keys, usa quelli come IDs certi.
        // Altrimenti: inserted+skipped = "accettati" dal server (deduplicati o nuovi).
        // Non marcare se ci sono errori e inserted = 0 (significa che tutto è stato rifiutato).
        const serverAccepted = json.inserted + json.skipped;
        if (json.inserted_keys?.length) {
          // Precisione massima: marca solo gli ID esplicitamente confermati
          await markCheckInsSynced(json.inserted_keys);
          totalSynced += json.inserted_keys.length;
        } else if (serverAccepted > 0 && (!json.errors?.length || json.inserted > 0)) {
          // Marca come sincronizzati tutti gli elementi del batch
          // (il server li ha processati tutti, anche i duplicati via source_key)
          await markCheckInsSynced(batch.map((c) => c.id));
          totalSynced += batch.length;
        } else if (json.errors?.length && json.inserted === 0) {
          // Tutto rifiutato con errori — NON marcare come sincronizzati, lascia in coda
          // (verranno ritentati alla prossima sync)
        }
        onProgress?.(totalSynced, pending.length);
      } else {
        errors.push('Il server ha risposto con ok: false');
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  // Aggiorna il timestamp lastSyncAt se almeno un item è stato sincronizzato
  if (totalSynced > 0) {
    const current = await getGiPSigoConfig();
    if (current) {
      await saveGiPSigoConfig({ ...current, lastSyncAt: Date.now() });
    }
  }

  return { synced: totalSynced, errors };
}

/**
 * Inizializza il listener dell'evento `online` per il sync automatico.
 * Da chiamare una sola volta (es. in App.tsx al mount).
 *
 * @returns una funzione cleanup per rimuovere il listener.
 */
export function initGiPSigoAutoSync(
  getConfig: () => GiPSigoConfig | null,
  onSyncComplete?: (result: { synced: number; errors: string[] }) => void,
): () => void {
  const handleOnline = async () => {
    const config = getConfig();
    if (!config?.enabled) return;

    const result = await syncPendingCheckIns(config);
    onSyncComplete?.(result);
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}
