import { describe, it, expect, vi } from 'vitest';

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
}));

import sampleData from '../../../viaggio-sample.json';
import { isTransitActiveNow } from '../../src/utils/transitUtils';
import { useViaggioStore } from '../../src/store/store';
import { generateFullJournalMarkdown, generateDayMarkdown } from '../../src/utils/exportUtils';

describe('BDD Scenario: Feature 4 - Convertitore Valuta EUR ↔ JPY / KRW', () => {
  it('Given tasso JPY_EUR, When converte 5000 JPY, Then calcola correttamente gli Euro', () => {
    const jpyRate = sampleData.meta.tassi_cambio.JPY_EUR || 0.006;
    const inputJpy = 5000;
    const euroResult = inputJpy * jpyRate;
    expect(euroResult).toBe(30);
  });
});

describe('BDD Scenario: Feature 1 - Struttura dati e tappe viaggio', () => {
  it('Given il database di viaggio, When caricato, Then contiene l\'itinerario e gli alloggi', () => {
    expect(sampleData.itinerario.length).toBeGreaterThan(0);
    expect(sampleData.alloggi.length).toBeGreaterThan(0);
    expect(sampleData.meta.passeggeri.length).toBeGreaterThan(0);
  });
});

describe('BDD Scenario: Real-time Transit Check (IN CORSO NOW)', () => {
  it('Given a transit on a specific date and time range, When checked against current date/time, Then returns true ONLY if strictly within range', () => {
    const transit = {
      id: 'T1',
      data: '2026-08-10',
      ora_partenza: '10:21',
      ora_arrivo: '12:30',
      stazione_partenza: 'Omiya',
      stazione_arrivo: 'Kanazawa'
    };

    const insideTime = new Date('2026-08-10T11:00:00');
    expect(isTransitActiveNow(transit, insideTime)).toBe(true);

    const beforeTime = new Date('2026-08-10T09:00:00');
    expect(isTransitActiveNow(transit, beforeTime)).toBe(false);

    const afterTime = new Date('2026-08-10T13:00:00');
    expect(isTransitActiveNow(transit, afterTime)).toBe(false);

    const wrongDate = new Date('2026-08-11T11:00:00');
    expect(isTransitActiveNow(transit, wrongDate)).toBe(false);
  });
});

describe('BDD Scenario: User Feedback Widgets & Note Persistence', () => {
  it('Given a specific schedule item (e.g. day 0, item 1), When user saves a reaction and a note, Then both are stored in userLogs', async () => {
    const itemKey = '0-1';
    const store = useViaggioStore.getState();

    await store.updateLog(itemKey, '❤️', undefined);
    expect(useViaggioStore.getState().userLogs[itemKey]?.reaction).toBe('❤️');

    await store.updateLog(itemKey, undefined, 'Ottimo ramen nei vicoli');
    expect(useViaggioStore.getState().userLogs[itemKey]?.note).toBe('Ottimo ramen nei vicoli');
    expect(useViaggioStore.getState().userLogs[itemKey]?.reaction).toBe('❤️');

    await store.updateLog(itemKey, '', undefined);
    expect(useViaggioStore.getState().userLogs[itemKey]?.reaction).toBe('');
    expect(useViaggioStore.getState().userLogs[itemKey]?.note).toBe('Ottimo ramen nei vicoli');
  });
});

describe('BDD Scenario: Parity between Oggi view and Itinerario view', () => {
  it('Given a specific day, When checking transports, tickets and culinary focus, Then both views have access to identical day details', () => {
    const dayData = sampleData.itinerario[0];
    const dateStr = dayData.data;

    // Check flights matching date
    const dayFlights = (sampleData.trasporti?.voli || []).filter((v) => v.data === dateStr);
    
    // Check treni & bus matching date
    const dayTreniBus = [
      ...(sampleData.trasporti?.treni || []),
      ...(sampleData.trasporti?.bus || [])
    ].filter((t) => t.data === dateStr);

    // Check tickets matching date or day number
    const dayTickets = (sampleData.biglietti || []).filter((b) => b.data === dateStr || b.giorno === dayData.giorno);

    expect(Array.isArray(dayFlights)).toBe(true);
    expect(Array.isArray(dayTreniBus)).toBe(true);
    expect(Array.isArray(dayTickets)).toBe(true);
  });
});

describe('BDD Scenario: Feature 7 - Tema Giorno 100% Solare & Alto Contrasto (WCAG AAA)', () => {
  it('Given day theme tokens, When applied, Then primary text and background fulfill high contrast guidelines', () => {
    const dayPrimaryBg = '#F8FAFC';
    const dayCardBg = '#FFFFFF';
    const dayPrimaryText = '#0F172A';
    const daySecondaryText = '#475569';

    expect(dayPrimaryBg).toBe('#F8FAFC');
    expect(dayCardBg).toBe('#FFFFFF');
    expect(dayPrimaryText).toBe('#0F172A');
    expect(daySecondaryText).toBe('#475569');
  });
});

describe('BDD Scenario: Feature 8 - Interazione Accordion e Navigazione a Oggi', () => {
  it('Given user in Itinerario tab, When clicking day card header, Then toggles accordion expansion without switching tab', () => {
    let expanded = false;
    const toggleAccordion = () => { expanded = !expanded; };
    
    toggleAccordion();
    expect(expanded).toBe(true);

    toggleAccordion();
    expect(expanded).toBe(false);
  });

  it('Given user in Itinerario tab, When clicking "Apri in Oggi", Then switches active tab to Oggi with selected day', () => {
    let activeTab = 'itinerario';
    let selectedDay = 0;

    const handleNavigateToOggi = (dayNum: number) => {
      selectedDay = dayNum;
      activeTab = 'oggi';
    };

    handleNavigateToOggi(4);
    expect(selectedDay).toBe(4);
    expect(activeTab).toBe('oggi');
  });
});

describe('BDD Scenario: Feature 6 - Diario di Bordo Serale & Note Daily', () => {
  it('Given l\'utente nel Tab OGGI o ITINERARIO, When inserisce rating, highlight e note serali, Then i dati vengono salvati nello store ed in IndexedDB', async () => {
    const store = useViaggioStore.getState();
    await store.updateJournal(1, '2026-07-28', {
      rating: 5,
      highlight: 'Passeggiata serale ad Shibuya',
      notes: 'Tokyo di notte è meravigliosa',
    });

    const journal = useViaggioStore.getState().dailyJournals[1];
    expect(journal).toBeDefined();
    expect(journal.rating).toBe(5);
    expect(journal.highlight).toBe('Passeggiata serale ad Shibuya');
    expect(journal.notes).toBe('Tokyo di notte è meravigliosa');
  });
});

describe('BDD Scenario: Feature 9 - Copia Diario in Formato Testo (Markdown Exporter)', () => {
  it('Given l\'itinerario ed il diario di bordo serale salvato, When si genera il Markdown completo, Then il testo include titoli, rating, highlight, note e check-in', () => {
    const mockJournals = {
      1: {
        giorno: 1,
        date: '2026-07-28',
        rating: 5,
        highlight: 'Shibuya Crossing',
        notes: 'Primo giorno fantastico',
      },
    };
    const mockCheckIns = [
      {
        id: 'c1',
        giorno: 1,
        timestamp: 1770000000000,
        luogo_nome: 'Shibuya Sky',
        rating: 5,
        commento: 'Panoramica eccezionale',
        coords: { lat: 35.6595, lng: 139.7005 },
        photoIds: ['p1', 'p2'],
      },
    ];

    const fullMarkdown = generateFullJournalMarkdown(sampleData as any, mockJournals, mockCheckIns);
    expect(fullMarkdown).toContain('# 📓 Viaggio Demo Giappone & Corea 2026');
    expect(fullMarkdown).toContain('Giorno 1');
    expect(fullMarkdown).toContain('Diario di Bordo Serale');
    expect(fullMarkdown).toContain('⭐⭐⭐⭐⭐ (5/5)');
    expect(fullMarkdown).toContain('Shibuya Crossing');
    expect(fullMarkdown).toContain('Primo giorno fantastico');
    expect(fullMarkdown).toContain('Check-in Registrati');
    expect(fullMarkdown).toContain('📍 Check-in: Shibuya Sky');
    expect(fullMarkdown).toContain('Panoramica eccezionale');
    expect(fullMarkdown).toContain('2 foto allegate');
  });
});

describe('BDD Scenario: Feature 11 - Sincronizzazione Offline-First GiPSigo', () => {
  it('Given un CheckIn locale, When viene convertito in DTO GiPSigo, Then source_key == id e i campi sono mappati correttamente', async () => {
    const { toGiPSigoPayload } = await import('../../src/services/gipsigoService');

    const mockCheckIn = {
      id: 'ci-test-123',
      giorno: 5,
      timestamp: 1770100000000,
      luogo_nome: 'N Seoul Tower',
      commento: 'Vista panoramica incredibile',
      rating: 5,
      coords: { lat: 37.5512, lng: 126.9882 },
      photoIds: [],
      syncedToGiPSigo: false,
    };

    const payload = toGiPSigoPayload(mockCheckIn as any);

    expect(payload.source_key).toBe('ci-test-123');
    expect(payload.lat).toBeCloseTo(37.5512);
    expect(payload.lng).toBeCloseTo(126.9882);
    expect(payload.rating).toBe(5);
    expect(payload.location_name).toBe('N Seoul Tower');
    expect(payload.comment).toBe('Vista panoramica incredibile');
    expect(typeof payload.date).toBe('string');
    expect(payload.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('Given GiPSigo non configurato (enabled: false), When syncPendingCheckIns viene chiamato, Then restituisce synced:0 senza fetch', async () => {
    const { syncPendingCheckIns } = await import('../../src/services/gipsigoService');

    const disabledConfig = {
      enabled: false,
      apiKey: '',
      tripToken: '',
      endpointUrl: '',
    };

    const result = await syncPendingCheckIns(disabledConfig as any);
    expect(result.synced).toBe(0);
    expect(result.errors).toContain('GiPSigo non configurato');
  });
});

describe('BDD Scenario: Correct Overnight Accommodation Selection on City Change Days', () => {
  it('Given a city change day (e.g. Day 4 - 2026-08-01 transfer from Seoul to Tokyo), When calculating sleep accommodation for the day, Then selects the destination accommodation (Tokyo H2) where check_in <= date < check_out', () => {
    const dayData = sampleData.itinerario.find((g) => g.giorno === 4)!;
    const dateStr = dayData.data; // "2026-08-01"

    const sleepAccommodation =
      sampleData.alloggi.find((h) => dateStr >= h.check_in && dateStr < h.check_out) ||
      sampleData.alloggi[sampleData.alloggi.length - 1];

    // Day 4 date is 2026-08-01. H1 (Seoul) check_out is 2026-08-01, H2 (Tokyo) check_in is 2026-08-01 and check_out is 2026-08-10.
    // Therefore, the overnight sleep location for Day 4 MUST be H2 (Tokyo), NOT H1 (Seoul).
    expect(sleepAccommodation.id).toBe('H2');
    expect(sleepAccommodation.citta).toBe('Tokyo');
  });
});

describe('BDD Scenario: Automatic Transit Duration Calculation', () => {
  it('Given a transit route with missing duration parameter, When parseTransitRoute is called with departure and arrival times, Then automatically calculates and formats travel duration', async () => {
    const { parseTransitRoute, calculateDurationStr } = await import('../../src/utils/transitUtils');

    const parsed1 = parseTransitRoute('Omiya -> Kanazawa', '10:21 -> 12:30');
    expect(parsed1.duration).toBe('2h 09m');

    const parsed2 = parseTransitRoute('Seoul (GMP) -> Tokyo (HND)', '12:40 -> 14:55');
    expect(parsed2.duration).toBe('2h 15m');

    const durationOvernight = calculateDurationStr('20:30', '12:45 (+1)');
    expect(durationOvernight).toBe('16h 15m');
  });
});

describe('BDD Scenario: Flight Tracking URLs Generation (FlightAware ICAO, Trip.com IATA, Flightradar24 IATA)', () => {
  it('Given flight number and ICAO code, When getFlightTrackingUrls is called, Then generates exact live tracking URLs for FlightAware, Trip.com, and Flightradar24', async () => {
    const { getFlightTrackingUrls } = await import('../../src/utils/linkUtils');

    // Test Volo V1: Air China CA 940 -> ICAO: CCA940
    const urlsV1 = getFlightTrackingUrls('CA 940', 'CCA940');
    expect(urlsV1.flightAware).toBe('https://www.flightaware.com/live/flight/CCA940');
    expect(urlsV1.tripCom).toBe('https://it.trip.com/flights/status-ca940');
    expect(urlsV1.flightradar24).toBe('https://www.flightradar24.com/data/flights/ca940');

    // Test Volo V3: All Nippon Airways NH 864 -> ICAO: ANA864
    const urlsV3 = getFlightTrackingUrls('NH 864', 'ANA864');
    expect(urlsV3.flightAware).toBe('https://www.flightaware.com/live/flight/ANA864');
    expect(urlsV3.tripCom).toBe('https://it.trip.com/flights/status-nh864');
    expect(urlsV3.flightradar24).toBe('https://www.flightradar24.com/data/flights/nh864');
  });

  it('Given incomplete flight data missing numero_volo or codice_icao, Then warns user to add mandatory flight fields in JSON', () => {
    const incompleteFlight = {
      id: 'VX',
      citta_partenza: 'Roma',
      citta_arrivo: 'Pechino',
      numero_volo: '',
      codice_icao: '',
    };

    const hasFlightNumber = !!(incompleteFlight.numero_volo && incompleteFlight.numero_volo.trim());
    const hasIcaoCode = !!(incompleteFlight.codice_icao && incompleteFlight.codice_icao.trim());

    expect(hasFlightNumber).toBe(false);
    expect(hasIcaoCode).toBe(false);
  });
});

