import { create } from 'zustand';
import type { ViaggioData, TravelLog } from '../types/viaggio';
import {
  getViaggioData,
  saveViaggioData,
  getTodos,
  saveTodos,
  getLogs,
  saveLog,
  getCustomRates,
  saveCustomRates,
  getCustomTodos,
  saveCustomTodos,
  clearAllData,
} from './db';
import type { CustomRates } from './db';


export type ActiveTab = 'oggi' | 'itinerario' | 'trasporti' | 'guida' | 'emergenze';

export interface TaxiCardData {
  name: string;
  addressLocale: string;
  addressEn?: string;
}

export interface ViaggioState {
  // State
  data: ViaggioData | null;
  activeTab: ActiveTab;
  selectedDay: number;
  showRainPlan: boolean;
  activeTaxiCard: TaxiCardData | null;
  showCurrencyModal: boolean;
  toastMessage: string | null;
  userLogs: Record<string, TravelLog>;
  userTodos: Record<number, boolean[]>;
  customTodos: Record<number, string[]>;
  customRates: CustomRates | null;
  isLoading: boolean;

  // Actions
  setViaggioData: (data: ViaggioData) => Promise<void>;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedDay: (day: number) => void;
  toggleRainPlan: () => void;
  openTaxiCard: (card: TaxiCardData) => void;
  closeTaxiCard: () => void;
  toggleCurrencyModal: () => void;
  showToast: (message: string, durationMs?: number) => void;
  updateTodo: (giorno: number, todoIndex: number, done: boolean) => Promise<void>;
  addCustomTodo: (giorno: number, testo: string) => Promise<void>;
  removeCustomTodo: (giorno: number, index: number) => Promise<void>;
  updateCustomRates: (rates: CustomRates) => Promise<void>;
  updateLog: (itemKey: string, reaction?: string, note?: string) => Promise<void>;
  clearDatabase: () => Promise<void>;
  loadInitialData: () => Promise<void>;
}

export function calculateCurrentTripDay(itinerario: ViaggioData['itinerario']): number {
  if (!itinerario || itinerario.length === 0) return 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const foundIndex = itinerario.findIndex((g) => g.data === todayStr);
  if (foundIndex !== -1) {
    return itinerario[foundIndex].giorno;
  }
  return 0;
}

export const useViaggioStore = create<ViaggioState>((set, get) => ({
  data: null,
  activeTab: 'oggi',
  selectedDay: 0,
  showRainPlan: false,
  activeTaxiCard: null,
  showCurrencyModal: false,
  toastMessage: null,
  userLogs: {},
  userTodos: {},
  customTodos: {},
  customRates: null,
  isLoading: true,

  setViaggioData: async (data: ViaggioData) => {
    await saveViaggioData(data);

    const { userTodos } = get();
    const updatedTodos = { ...userTodos };
    data.itinerario.forEach((g) => {
      if (!updatedTodos[g.giorno]) {
        updatedTodos[g.giorno] = g.todo_list.map((t) => t.fatto);
      }
    });
    await saveTodos(updatedTodos);

    const calculatedDay = calculateCurrentTripDay(data.itinerario);

    set({
      data,
      userTodos: updatedTodos,
      selectedDay: calculatedDay,
    });
  },

  setActiveTab: (tab: ActiveTab) => set({ activeTab: tab }),

  setSelectedDay: (day: number) => set({ selectedDay: day }),

  toggleRainPlan: () => set((state) => ({ showRainPlan: !state.showRainPlan })),

  openTaxiCard: (card: TaxiCardData) => set({ activeTaxiCard: card }),

  closeTaxiCard: () => set({ activeTaxiCard: null }),

  toggleCurrencyModal: () => set((state) => ({ showCurrencyModal: !state.showCurrencyModal })),

  showToast: (message: string, durationMs = 2500) => {
    set({ toastMessage: message });
    setTimeout(() => {
      if (get().toastMessage === message) {
        set({ toastMessage: null });
      }
    }, durationMs);
  },

  updateTodo: async (giorno: number, todoIndex: number, done: boolean) => {
    const { userTodos } = get();
    const currentList = userTodos[giorno] ? [...userTodos[giorno]] : [];
    currentList[todoIndex] = done;
    const nextTodos = { ...userTodos, [giorno]: currentList };

    set({ userTodos: nextTodos });
    await saveTodos(nextTodos);
  },

  addCustomTodo: async (giorno: number, testo: string) => {
    if (!testo.trim()) return;
    const { customTodos } = get();
    const currentList = customTodos[giorno] ? [...customTodos[giorno]] : [];
    const nextList = [...currentList, testo.trim()];
    const nextCustomTodos = { ...customTodos, [giorno]: nextList };

    set({ customTodos: nextCustomTodos });
    await saveCustomTodos(nextCustomTodos);
  },

  removeCustomTodo: async (giorno: number, index: number) => {
    const { customTodos } = get();
    const currentList = customTodos[giorno] ? [...customTodos[giorno]] : [];
    currentList.splice(index, 1);
    const nextCustomTodos = { ...customTodos, [giorno]: currentList };

    set({ customTodos: nextCustomTodos });
    await saveCustomTodos(nextCustomTodos);
  },

  updateCustomRates: async (rates: CustomRates) => {
    set({ customRates: rates });
    await saveCustomRates(rates);
  },

  updateLog: async (itemKey: string, reaction?: string, note?: string) => {
    const { userLogs } = get();
    const current = userLogs[itemKey] || {};
    const updatedEntry: TravelLog = {
      reaction: reaction !== undefined ? reaction : current.reaction,
      note: note !== undefined ? note : current.note,
      updatedAt: Date.now(),
    };

    const nextLogs = {
      ...userLogs,
      [itemKey]: updatedEntry,
    };

    set({ userLogs: nextLogs });
    await saveLog(itemKey, updatedEntry);
  },

  clearDatabase: async () => {
    await clearAllData();
    set({
      data: null,
      userLogs: {},
      userTodos: {},
      customTodos: {},
      customRates: null,
      selectedDay: 0,
    });
  },

  loadInitialData: async () => {
    set({ isLoading: true });
    try {
      const data = await getViaggioData();
      const savedTodos = await getTodos();
      const savedLogs = await getLogs();
      const savedCustomTodos = await getCustomTodos();
      const savedCustomRates = await getCustomRates();

      let userTodos: Record<number, boolean[]> = savedTodos || {};
      if (data && Object.keys(userTodos).length === 0) {
        data.itinerario.forEach((g) => {
          userTodos[g.giorno] = g.todo_list.map((t) => t.fatto);
        });
        await saveTodos(userTodos);
      }

      const selectedDay = data ? calculateCurrentTripDay(data.itinerario) : 0;

      set({
        data: data || null,
        userTodos,
        userLogs: savedLogs || {},
        customTodos: savedCustomTodos || {},
        customRates: savedCustomRates || null,
        selectedDay,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error loading initial state:', err);
      set({
        data: null,
        isLoading: false,
      });
    }
  },
}));
