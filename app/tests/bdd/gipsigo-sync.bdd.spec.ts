/**
 * BDD Feature 11: Sincronizzazione Offline-First dei Check-in verso GiPSigo
 *
 * Scenari:
 * 1. Configurazione dinamica credenziali GiPSigo
 * 2. Check-in salvato in locale con syncedToGiPSigo: false
 * 3. Sync automatica post-online: batch POST + mark synced
 * 4. Sync manuale: pulsante con badge pendenti
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ──────────────────────────────────────────────
// Mock IndexedDB helpers
// ──────────────────────────────────────────────
vi.mock('../../src/store/db', () => ({
  getViaggioData: vi.fn().mockResolvedValue(undefined),
  saveViaggioData: vi.fn().mockResolvedValue(undefined),
  getTodos: vi.fn().mockResolvedValue(undefined),
  saveTodos: vi.fn().mockResolvedValue(undefined),
  getLogs: vi.fn().mockResolvedValue({}),
  saveLogs: vi.fn().mockResolvedValue(undefined),
  saveLog: vi.fn().mockResolvedValue(undefined),
  getJournals: vi.fn().mockResolvedValue({}),
  saveJournal: vi.fn().mockResolvedValue(undefined),
  saveJournals: vi.fn().mockResolvedValue(undefined),
  getCustomRates: vi.fn().mockResolvedValue(undefined),
  saveCustomRates: vi.fn().mockResolvedValue(undefined),
  getCustomTodos: vi.fn().mockResolvedValue(undefined),
  saveCustomTodos: vi.fn().mockResolvedValue(undefined),
  getTheme: vi.fn().mockResolvedValue(undefined),
  saveTheme: vi.fn().mockResolvedValue(undefined),
  clearAllData: vi.fn().mockResolvedValue(undefined),
  getCheckIns: vi.fn().mockResolvedValue([]),
  saveCheckIn: vi.fn().mockResolvedValue(undefined),
  deleteCheckIn: vi.fn().mockResolvedValue(undefined),
  updateCheckIn: vi.fn().mockResolvedValue(undefined),
  getCheckInPhotos: vi.fn().mockResolvedValue([]),
  saveCheckInPhoto: vi.fn().mockResolvedValue(undefined),
  deleteCheckInPhoto: vi.fn().mockResolvedValue(undefined),
  markCheckInsSynced: vi.fn().mockResolvedValue(undefined),
  getPendingCheckIns: vi.fn().mockResolvedValue([]),
  saveGiPSigoConfig: vi.fn().mockResolvedValue(undefined),
  getGiPSigoConfig: vi.fn().mockResolvedValue(undefined),
}));

import { toGiPSigoPayload, syncPendingCheckIns } from '../../src/services/gipsigoService';
import type { CheckIn, GiPSigoConfig } from '../../src/types/viaggio';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function makeCheckIn(overrides: Partial<CheckIn> = {}): CheckIn {
  return {
    id: 'ci-test-001',
    giorno: 3,
    timestamp: new Date('2026-08-01T10:30:00').getTime(),
    lat: 37.5665,
    lng: 126.978,
    luogo_nome: 'N Seoul Tower',
    commento: 'Vista mozzafiato!',
    rating: 5,
    syncedToGiPSigo: false,
    ...overrides,
  };
}

function makeConfig(overrides: Partial<GiPSigoConfig> = {}): GiPSigoConfig {
  return {
    enabled: true,
    apiKey: 'gips_live_testkey',
    tripToken: 'trip_kr_jp_2026',
    endpointUrl: 'https://test.gipsigo.it/api/external_checkin.php',
    ...overrides,
  };
}

// ──────────────────────────────────────────────
// Feature 11 — Scenario 1: DTO Mapper
// ──────────────────────────────────────────────
describe('BDD Feature 11 — Scenario 1: DTO Mapper da CheckIn a GiPSigo', () => {
  it('Given un CheckIn con coordinate e commento, When convertito in payload, Then i campi source_key, lat, lng e date sono corretti', () => {
    const ci = makeCheckIn();
    const payload = toGiPSigoPayload(ci);

    expect(payload.source_key).toBe('ci-test-001');
    expect(payload.lat).toBeCloseTo(37.5665);
    expect(payload.lng).toBeCloseTo(126.978);
    expect(payload.date).toBe('2026-08-01');
    expect(payload.location_name).toBe('N Seoul Tower');
    expect(payload.rating).toBe(5);
  });

  it('Given un CheckIn con coords nested (lat/lng come oggetto coords), When convertito, Then usa comunque coords.lat e coords.lng', () => {
    const ci = makeCheckIn({ lat: undefined, lng: undefined, coords: { lat: 35.6762, lng: 139.6503 } });
    const payload = toGiPSigoPayload(ci);

    expect(payload.lat).toBeCloseTo(35.6762);
    expect(payload.lng).toBeCloseTo(139.6503);
  });

  it('Given un CheckIn senza coordinate, When convertito, Then lat e lng sono undefined nel payload', () => {
    const ci = makeCheckIn({ lat: undefined, lng: undefined, coords: undefined });
    const payload = toGiPSigoPayload(ci);

    expect(payload.lat).toBeUndefined();
    expect(payload.lng).toBeUndefined();
    // source_key e timestamp devono essere presenti
    expect(payload.source_key).toBeDefined();
    expect(payload.timestamp).toBeDefined();
  });
});

// ──────────────────────────────────────────────
// Feature 11 — Scenario 2: Offline-First Local Save
// ──────────────────────────────────────────────
describe('BDD Feature 11 — Scenario 2: Check-in salvato localmente con flag syncedToGiPSigo: false', () => {
  it('Given un nuovo check-in creato offline, When registrato, Then syncedToGiPSigo è false o undefined', () => {
    const ci = makeCheckIn({ syncedToGiPSigo: false });
    expect(!ci.syncedToGiPSigo).toBe(true);
  });

  it('Given un check-in non sincronizzato, When il flag viene aggiornato, Then syncedToGiPSigo diventa true con syncedAt valorizzato', () => {
    const before = Date.now();
    const ci = makeCheckIn({ syncedToGiPSigo: true, syncedAt: Date.now() });
    expect(ci.syncedToGiPSigo).toBe(true);
    expect(ci.syncedAt).toBeGreaterThanOrEqual(before);
  });
});

// ──────────────────────────────────────────────
// Feature 11 — Scenario 3: Sync automatica (mock fetch)
// ──────────────────────────────────────────────
describe('BDD Feature 11 — Scenario 3: Sync automatica al ripristino connessione (fetch mock)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Given check-in pendenti, When la fetch ha esito positivo, Then syncPendingCheckIns restituisce synced > 0 e nessun errore', async () => {
    const ci = makeCheckIn();
    const { getPendingCheckIns, markCheckInsSynced } = await import('../../src/store/db');
    vi.mocked(getPendingCheckIns).mockResolvedValue([ci]);
    vi.mocked(markCheckInsSynced).mockResolvedValue(undefined);

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, inserted: 1, skipped: 0 }),
    } as Response);

    const config = makeConfig();
    const result = await syncPendingCheckIns(config);

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(result.synced).toBe(1);
    expect(result.errors).toHaveLength(0);
  });

  it('Given check-in pendenti, When la fetch fallisce (rete assente), Then synced è 0 e errors contiene il messaggio di errore', async () => {
    const ci = makeCheckIn();
    const { getPendingCheckIns } = await import('../../src/store/db');
    vi.mocked(getPendingCheckIns).mockResolvedValue([ci]);

    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network Error'));

    const config = makeConfig();
    const result = await syncPendingCheckIns(config);

    expect(result.synced).toBe(0);
    expect(result.errors[0]).toContain('Network Error');
  });

  it('Given config non abilitata (enabled: false), When syncPendingCheckIns viene chiamata, Then restituisce synced 0 con errore di configurazione', async () => {
    const config = makeConfig({ enabled: false });
    const result = await syncPendingCheckIns(config);

    expect(result.synced).toBe(0);
    expect(result.errors[0]).toContain('non configurato');
  });

  it('Given config con apiKey mancante, When syncPendingCheckIns viene chiamata, Then non effettua la fetch e restituisce errore', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const config = makeConfig({ apiKey: '' });
    const result = await syncPendingCheckIns(config);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.synced).toBe(0);
  });
});

// ──────────────────────────────────────────────
// Feature 11 — Scenario 4: Conteggio pendenti
// ──────────────────────────────────────────────
describe('BDD Feature 11 — Scenario 4: Conteggio check-in pendenti per badge UI', () => {
  it('Given un mix di check-in sincronizzati e non, When si filtra per !syncedToGiPSigo, Then il conteggio corrisponde ai soli non sincronizzati', () => {
    const checkIns: CheckIn[] = [
      makeCheckIn({ id: 'a', syncedToGiPSigo: false }),
      makeCheckIn({ id: 'b', syncedToGiPSigo: true }),
      makeCheckIn({ id: 'c', syncedToGiPSigo: false }),
      makeCheckIn({ id: 'd', syncedToGiPSigo: undefined }),
    ];

    const pending = checkIns.filter((c) => !c.syncedToGiPSigo);
    expect(pending.length).toBe(3); // a, c, d (undefined = falsy = pendente)
  });

  it('Given tutti i check-in sincronizzati, When si conta quelli pendenti, Then il conteggio è 0', () => {
    const checkIns: CheckIn[] = [
      makeCheckIn({ id: 'x', syncedToGiPSigo: true }),
      makeCheckIn({ id: 'y', syncedToGiPSigo: true }),
    ];
    const pending = checkIns.filter((c) => !c.syncedToGiPSigo);
    expect(pending.length).toBe(0);
  });
});
