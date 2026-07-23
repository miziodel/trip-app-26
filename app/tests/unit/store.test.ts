import { describe, it, expect, beforeEach, vi } from 'vitest';

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
  getCheckIns: vi.fn().mockResolvedValue([]),
  saveCheckIn: vi.fn().mockResolvedValue(undefined),
  deleteCheckIn: vi.fn().mockResolvedValue(undefined),
  getCheckInPhotos: vi.fn().mockResolvedValue([]),
  saveCheckInPhoto: vi.fn().mockResolvedValue(undefined),
  deleteCheckInPhoto: vi.fn().mockResolvedValue(undefined),
  clearAllData: vi.fn().mockResolvedValue(undefined),
}));

import { useViaggioStore } from '../../src/store/store';

describe('ViaggioStore - customRates, customTodos, clearDatabase, loadInitialData', () => {
  beforeEach(() => {
    useViaggioStore.setState({
      data: null,
      customRates: null,
      customTodos: {},
      userTodos: {},
      userLogs: {},
      isLoading: false,
    });
  });

  it('ha lo stato iniziale corretto per customRates e customTodos', () => {
    const state = useViaggioStore.getState();
    expect(state.customRates).toBeNull();
    expect(state.customTodos).toEqual({});
    expect(state.data).toBeNull();
  });

  it('updateCustomRates aggiorna lo stato customRates', async () => {
    const rates = { JPY_EUR: 0.0062, KRW_EUR: 0.0007 };
    await useViaggioStore.getState().updateCustomRates(rates);
    expect(useViaggioStore.getState().customRates).toEqual(rates);
  });

  it('addCustomTodo e removeCustomTodo modificano customTodos', async () => {
    await useViaggioStore.getState().addCustomTodo(1, 'Comprare SIM card');
    expect(useViaggioStore.getState().customTodos[1]).toEqual(['Comprare SIM card']);

    await useViaggioStore.getState().addCustomTodo(1, 'Prenotare ristorante');
    expect(useViaggioStore.getState().customTodos[1]).toEqual([
      'Comprare SIM card',
      'Prenotare ristorante',
    ]);

    await useViaggioStore.getState().removeCustomTodo(1, 0);
    expect(useViaggioStore.getState().customTodos[1]).toEqual(['Prenotare ristorante']);
  });

  it('clearDatabase resetta lo stato a null e svuota IndexedDB', async () => {
    await useViaggioStore.getState().updateCustomRates({ JPY_EUR: 0.006, KRW_EUR: 0.00068 });
    await useViaggioStore.getState().addCustomTodo(1, 'Test todo');
    
    await useViaggioStore.getState().clearDatabase();

    const state = useViaggioStore.getState();
    expect(state.data).toBeNull();
    expect(state.customRates).toBeNull();
    expect(state.customTodos).toEqual({});
  });

  it('loadInitialData imposta data: null quando IndexedDB è vuoto', async () => {
    await useViaggioStore.getState().loadInitialData();
    const state = useViaggioStore.getState();
    expect(state.data).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('openTaxiCard e closeTaxiCard gestiscono activeTaxiCard', () => {
    useViaggioStore.getState().openTaxiCard({
      name: 'Wecostay Insadong',
      nameLocale: '위코스테이 인사동',
      addressLocale: '서울특별시 종로구',
    });
    expect(useViaggioStore.getState().activeTaxiCard).toEqual({
      name: 'Wecostay Insadong',
      nameLocale: '위코스테이 인사동',
      addressLocale: '서울특별시 종로구',
    });

    useViaggioStore.getState().closeTaxiCard();
    expect(useViaggioStore.getState().activeTaxiCard).toBeNull();
  });

  it('updateJournal salva rating, highlight e note serali in dailyJournals', async () => {
    await useViaggioStore.getState().updateJournal(1, '2026-07-28', {
      rating: 5,
      highlight: 'Arrivo a Tokyo e prima ramen night',
      notes: 'Giornata stancante ma bellissima',
    });

    const journal = useViaggioStore.getState().dailyJournals[1];
    expect(journal).toBeDefined();
    expect(journal.giorno).toBe(1);
    expect(journal.date).toBe('2026-07-28');
    expect(journal.rating).toBe(5);
    expect(journal.highlight).toBe('Arrivo a Tokyo e prima ramen night');
    expect(journal.notes).toBe('Giornata stancante ma bellissima');
  });
});

