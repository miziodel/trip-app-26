import { describe, it, expect, beforeEach, vi } from 'vitest';

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
});
