import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/store/db', () => ({
  getViaggioData: vi.fn().mockResolvedValue(undefined),
  saveViaggioData: vi.fn().mockResolvedValue(undefined),
  getLogs: vi.fn().mockResolvedValue({}),
  saveLogs: vi.fn().mockResolvedValue(undefined),
  saveLog: vi.fn().mockResolvedValue(undefined),
  getCustomRates: vi.fn().mockResolvedValue({ JPY_EUR: 0.006, KRW_EUR: 0.00068 }),
  saveCustomRates: vi.fn().mockResolvedValue(undefined),
  getCustomTodos: vi.fn().mockResolvedValue({}),
  saveCustomTodos: vi.fn().mockResolvedValue(undefined),
  clearAllData: vi.fn().mockResolvedValue(undefined),
}));

import { useViaggioStore } from '../../src/store/store';
import sampleData from '../../../viaggio-sample.json';

describe('Offline-First PWA Workflow & Persistence Test', () => {
  beforeEach(() => {
    useViaggioStore.setState({
      data: sampleData as any,
      customRates: { JPY_EUR: 0.006, KRW_EUR: 0.00068 },
      customTodos: {},
      userTodos: {},
      userLogs: {},
      isLoading: false,
    });
  });

  it('opera al 100% offline recuperando i tassi personalizzati salvati in locale', () => {
    const state = useViaggioStore.getState();
    expect(state.data).not.toBeNull();
    expect(state.customRates).toEqual({ JPY_EUR: 0.006, KRW_EUR: 0.00068 });
  });

  it('permette di salvare reazioni e note senza richiedere alcuna connessione di rete', async () => {
    await useViaggioStore.getState().updateLog('giorno-1', '❤️', 'Ramen fantastico a Shinjuku');

    const state = useViaggioStore.getState();
    expect(state.userLogs['giorno-1']?.reaction).toBe('❤️');
    expect(state.userLogs['giorno-1']?.note).toBe('Ramen fantastico a Shinjuku');
  });
});
