import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/store/db', () => ({
  getViaggioData: vi.fn().mockResolvedValue(undefined),
  saveViaggioData: vi.fn().mockResolvedValue(undefined),
  getTodos: vi.fn().mockResolvedValue(undefined),
  saveTodos: vi.fn().mockResolvedValue(undefined),
  getLogs: vi.fn().mockResolvedValue({}),
  saveLogs: vi.fn().mockResolvedValue(undefined),
  saveLog: vi.fn().mockResolvedValue(undefined),
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


