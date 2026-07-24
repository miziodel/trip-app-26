import { create } from 'zustand';
import type { ViaggioData, TravelLog, DailyJournal, CheckIn, CheckInPhoto, GiPSigoConfig } from '../types/viaggio';
import {
  getViaggioData,
  saveViaggioData,
  getTodos,
  saveTodos,
  getLogs,
  saveLog,
  getJournals,
  saveJournal,
  getCustomRates,
  saveCustomRates,
  getCustomTodos,
  saveCustomTodos,
  getTheme,
  saveTheme,
  getCheckIns,
  saveCheckIn,
  deleteCheckIn as dbDeleteCheckIn,
  getCheckInPhotos,
  saveCheckInPhoto,
  deleteCheckInPhoto,
  clearAllData,
  markCheckInsSynced as dbMarkCheckInsSynced,
  saveGiPSigoConfig,
  getGiPSigoConfig,
} from './db';
import type { CustomRates } from './db';
import { resolveCheckInCoordinates } from '../utils/geoUtils';

export type ActiveTab = 'oggi' | 'itinerario' | 'trasporti' | 'guida' | 'emergenze';

export interface TaxiCardData {
  name: string;
  nameLocale?: string;
  addressLocale: string;
  addressEn?: string;
}

export interface CheckInModalOptions {
  isOpen?: boolean;
  defaultLocationName?: string;
  defaultGiorno?: number;
  scheduleItemId?: string;
  editingCheckIn?: CheckIn;
}

export interface ViaggioState {
  // State
  data: ViaggioData | null;
  activeTab: ActiveTab;
  selectedDay: number;
  showRainPlan: boolean;
  activeTaxiCard: TaxiCardData | null;
  activeCheckInModal: CheckInModalOptions | null;
  showCurrencyModal: boolean;
  showTodoDrawer: boolean;
  toastMessage: string | null;
  userLogs: Record<string, TravelLog>;
  dailyJournals: Record<number, DailyJournal>;
  userTodos: Record<number, boolean[]>;
  customTodos: Record<number, string[]>;
  customRates: CustomRates | null;
  theme: 'day' | 'night';
  isLoading: boolean;

  checkIns: Record<string, CheckIn>;
  checkInPhotos: Record<string, string>; // data URIs or blob URLs
  gipsigoConfig: GiPSigoConfig | null;

  // Actions
  setViaggioData: (data: ViaggioData) => Promise<void>;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedDay: (day: number) => void;
  toggleRainPlan: () => void;
  openTaxiCard: (card: TaxiCardData) => void;
  closeTaxiCard: () => void;
  openCheckInModal: (options?: CheckInModalOptions) => void;
  closeCheckInModal: () => void;
  toggleCurrencyModal: () => void;
  toggleTodoDrawer: () => void;
  showToast: (message: string, durationMs?: number) => void;
  updateTodo: (giorno: number, todoIndex: number, done: boolean) => Promise<void>;
  addCustomTodo: (giorno: number, testo: string) => Promise<void>;
  removeCustomTodo: (giorno: number, index: number) => Promise<void>;
  updateCustomRates: (rates: CustomRates) => Promise<void>;
  updateLog: (itemKey: string, reaction?: string, note?: string) => Promise<void>;
  updateJournal: (giorno: number, date: string, updates: Partial<Omit<DailyJournal, 'giorno' | 'date'>>) => Promise<void>;
  setTheme: (theme: 'day' | 'night') => Promise<void>;

  addCheckIn: (checkin: Omit<CheckIn, 'id' | 'timestamp'> & { timestamp?: number }, photoBlobs?: Blob[]) => Promise<CheckIn>;
  updateCheckIn: (checkInId: string, updates: Partial<CheckIn>, newPhotoBlobs?: Blob[]) => Promise<void>;
  removeCheckIn: (id: string) => Promise<void>;
  deleteCheckIn: (id: string) => Promise<void>;
  attachPhotosToCheckIn: (checkinId: string, photoBlobs: Blob[]) => Promise<void>;

  updateGiPSigoConfig: (config: Partial<GiPSigoConfig>) => Promise<void>;
  markCheckInsSyncedGiPSigo: (checkInIds: string[]) => Promise<void>;

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
  activeCheckInModal: null,
  showCurrencyModal: false,
  showTodoDrawer: false,
  toastMessage: null,
  userLogs: {},
  dailyJournals: {},
  userTodos: {},
  customTodos: {},
  customRates: null,
  theme: 'night',
  isLoading: true,
  checkIns: {},
  checkInPhotos: {},
  gipsigoConfig: null,

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

  openCheckInModal: (options) =>
    set({
      activeCheckInModal: {
        isOpen: true,
        defaultLocationName: options?.defaultLocationName,
        defaultGiorno: options?.defaultGiorno,
        scheduleItemId: options?.scheduleItemId,
        editingCheckIn: options?.editingCheckIn,
      },
    }),

  closeCheckInModal: () => set({ activeCheckInModal: null }),

  addCheckIn: async (checkinData: Omit<CheckIn, 'id' | 'timestamp'> & { timestamp?: number }, photoBlobs?: Blob[]) => {
    const id = `checkin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = checkinData.timestamp || Date.now();
    const photoIds: string[] = [];
    const newPhotosState: Record<string, string> = {};

    if (photoBlobs && photoBlobs.length > 0) {
      for (let i = 0; i < photoBlobs.length; i++) {
        const photoId = `photo_${id}_${i}_${Math.random().toString(36).substring(2, 6)}`;
        const photo: CheckInPhoto = {
          id: photoId,
          checkinId: id,
          blob: photoBlobs[i],
          timestamp,
        };
        await saveCheckInPhoto(photo);
        const objectUrl = URL.createObjectURL(photoBlobs[i]);
        newPhotosState[photoId] = objectUrl;
        photoIds.push(photoId);
      }
    }

    const name = checkinData.luogo_nome || checkinData.locationName || 'Check-in';
    const { data } = get();
    const resolvedCoords = resolveCheckInCoordinates(
      {
        lat: checkinData.lat ?? checkinData.coords?.lat,
        lng: checkinData.lng ?? checkinData.coords?.lng,
        coords: checkinData.coords,
        luogo_nome: name,
        giorno: checkinData.giorno,
      },
      data?.itinerario
    );

    const checkIn: CheckIn = {
      ...checkinData,
      id,
      timestamp,
      luogo_nome: name,
      locationName: name,
      commento: checkinData.commento || checkinData.comment,
      comment: checkinData.commento || checkinData.comment,
      coords: resolvedCoords,
      lat: resolvedCoords.lat,
      lng: resolvedCoords.lng,
      photoIds: photoIds.length > 0 ? photoIds : (checkinData.photoIds || checkinData.photos || []),
      photos: photoIds.length > 0 ? photoIds : (checkinData.photoIds || checkinData.photos || []),
      item_id: checkinData.item_id || checkinData.scheduleItemId,
      scheduleItemId: checkinData.item_id || checkinData.scheduleItemId,
    };

    await saveCheckIn(checkIn);

    set((state) => ({
      checkIns: { ...state.checkIns, [id]: checkIn },
      checkInPhotos: { ...state.checkInPhotos, ...newPhotosState },
    }));

    return checkIn;
  },

  updateCheckIn: async (checkInId: string, updates: Partial<CheckIn>, newPhotoBlobs?: Blob[]) => {
    const { checkIns, checkInPhotos } = get();
    const existing = checkIns[checkInId];
    if (!existing) return;

    const newPhotoIds: string[] = [];
    const newPhotosState: Record<string, string> = {};
    const timestamp = Date.now();

    if (newPhotoBlobs && newPhotoBlobs.length > 0) {
      for (let i = 0; i < newPhotoBlobs.length; i++) {
        const photoId = `photo_${checkInId}_${timestamp}_${i}_${Math.random().toString(36).substring(2, 6)}`;
        const photo: CheckInPhoto = {
          id: photoId,
          checkinId: checkInId,
          blob: newPhotoBlobs[i],
          timestamp,
        };
        await saveCheckInPhoto(photo);
        const objectUrl = URL.createObjectURL(newPhotoBlobs[i]);
        newPhotosState[photoId] = objectUrl;
        newPhotoIds.push(photoId);
      }
    }

    const currentPhotoIds = updates.photoIds || updates.photos || existing.photoIds || existing.photos || [];
    const finalPhotoIds = [...currentPhotoIds, ...newPhotoIds];

    const previousPhotoIds = existing.photoIds || existing.photos || [];
    const removedPhotoIds = previousPhotoIds.filter((pid) => !finalPhotoIds.includes(pid));

    const nextPhotosState = { ...checkInPhotos, ...newPhotosState };
    for (const pid of removedPhotoIds) {
      if (nextPhotosState[pid]) {
        if (nextPhotosState[pid].startsWith('blob:')) {
          URL.revokeObjectURL(nextPhotosState[pid]);
        }
        delete nextPhotosState[pid];
      }
      await deleteCheckInPhoto(pid);
    }

    const name = updates.luogo_nome || updates.locationName || existing.luogo_nome || existing.locationName || 'Check-in';
    const commentStr = updates.commento !== undefined ? updates.commento : (updates.comment !== undefined ? updates.comment : existing.comment);

    const updatedCheckIn: CheckIn = {
      ...existing,
      ...updates,
      id: checkInId,
      luogo_nome: name,
      locationName: name,
      commento: commentStr,
      comment: commentStr,
      coords: updates.coords || (updates.lat !== undefined && updates.lng !== undefined ? { lat: updates.lat, lng: updates.lng } : existing.coords),
      lat: updates.lat !== undefined ? updates.lat : existing.lat,
      lng: updates.lng !== undefined ? updates.lng : existing.lng,
      photoIds: finalPhotoIds,
      photos: finalPhotoIds,
    };

    await saveCheckIn(updatedCheckIn);

    set({
      checkIns: { ...checkIns, [checkInId]: updatedCheckIn },
      checkInPhotos: nextPhotosState,
    });
  },

  removeCheckIn: async (id: string) => {
    const { checkIns, checkInPhotos } = get();
    const checkin = checkIns[id];
    const nextCheckIns = { ...checkIns };
    delete nextCheckIns[id];

    const nextPhotos = { ...checkInPhotos };

    const ids = checkin?.photoIds || checkin?.photos;
    if (ids) {
      for (const photoId of ids) {
        if (nextPhotos[photoId]) {
          if (nextPhotos[photoId].startsWith('blob:')) {
            URL.revokeObjectURL(nextPhotos[photoId]);
          }
          delete nextPhotos[photoId];
        }
        await deleteCheckInPhoto(photoId);
      }
    }

    await dbDeleteCheckIn(id);

    set({
      checkIns: nextCheckIns,
      checkInPhotos: nextPhotos,
    });
  },

  deleteCheckIn: async (id: string) => {
    return get().removeCheckIn(id);
  },

  attachPhotosToCheckIn: async (checkinId: string, photoBlobs: Blob[]) => {
    const { checkIns, checkInPhotos } = get();
    const checkin = checkIns[checkinId];
    if (!checkin) return;

    if (!photoBlobs || photoBlobs.length === 0) return;

    const newPhotoIds: string[] = [];
    const newPhotosState: Record<string, string> = {};
    const timestamp = Date.now();

    for (let i = 0; i < photoBlobs.length; i++) {
      const photoId = `photo_${checkinId}_${timestamp}_${i}`;
      const photo: CheckInPhoto = {
        id: photoId,
        checkinId,
        blob: photoBlobs[i],
        timestamp,
      };
      await saveCheckInPhoto(photo);
      const objectUrl = URL.createObjectURL(photoBlobs[i]);
      newPhotosState[photoId] = objectUrl;
      newPhotoIds.push(photoId);
    }

    const existingPhotos = checkin.photoIds || checkin.photos || [];
    const updatedPhotoIds = [...existingPhotos, ...newPhotoIds];

    const updatedCheckin: CheckIn = {
      ...checkin,
      photoIds: updatedPhotoIds,
      photos: updatedPhotoIds,
    };

    await saveCheckIn(updatedCheckin);

    set({
      checkIns: { ...checkIns, [checkinId]: updatedCheckin },
      checkInPhotos: { ...checkInPhotos, ...newPhotosState },
    });
  },

  toggleCurrencyModal: () => set((state) => ({ showCurrencyModal: !state.showCurrencyModal })),

  toggleTodoDrawer: () => set((state) => ({ showTodoDrawer: !state.showTodoDrawer })),

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

  updateJournal: async (giorno: number, date: string, updates: Partial<Omit<DailyJournal, 'giorno' | 'date'>>) => {
    const { dailyJournals } = get();
    const current = dailyJournals[giorno] || { giorno, date };
    const updatedJournal: DailyJournal = {
      ...current,
      ...updates,
      giorno,
      date,
      updatedAt: Date.now(),
    };

    const nextJournals = {
      ...dailyJournals,
      [giorno]: updatedJournal,
    };

    set({ dailyJournals: nextJournals });
    await saveJournal(updatedJournal);
  },

  setTheme: async (newTheme: 'day' | 'night') => {
    set({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
    await saveTheme(newTheme);
  },

  clearDatabase: async () => {
    const { checkInPhotos } = get();
    Object.values(checkInPhotos).forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    await clearAllData();
    set({
      data: null,
      userLogs: {},
      dailyJournals: {},
      userTodos: {},
      customTodos: {},
      customRates: null,
      checkIns: {},
      checkInPhotos: {},
      selectedDay: 0,
    });
  },

  loadInitialData: async () => {
    set({ isLoading: true });
    try {
      let data: ViaggioData | undefined;
      let savedTodos: Record<number, boolean[]> | undefined;
      let savedLogs: Record<string, TravelLog> | undefined;
      let savedJournals: Record<number, DailyJournal> | undefined;
      let savedCustomTodos: Record<number, string[]> | undefined;
      let savedCustomRates: CustomRates | null = null;
      let savedTheme: 'day' | 'night' = 'night';
      let savedCheckIns: CheckIn[] | undefined;
      let savedCheckInPhotos: CheckInPhoto[] | undefined;

      try {
        // Race condition / timeout guard (3 seconds max for IDB open)
        const loadPromise = Promise.all([
          getViaggioData(),
          getTodos(),
          getLogs(),
          getJournals(),
          getCustomTodos(),
          getCustomRates(),
          getTheme(),
          getCheckIns(),
          getCheckInPhotos(),
        ]);

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('IndexedDB timeout/blocked')), 3000)
        );

        const results = await Promise.race([loadPromise, timeoutPromise]);
        [
          data,
          savedTodos,
          savedLogs,
          savedJournals,
          savedCustomTodos,
          savedCustomRates,
          savedTheme,
          savedCheckIns,
          savedCheckInPhotos,
        ] = results as any;
      } catch (dbErr) {
        console.warn('IndexedDB failed or blocked. Clearing DB automatically:', dbErr);
        try {
          await clearAllData();
        } catch (e) {
          // ignore
        }
      }

      savedTheme = savedTheme || 'night';
      document.documentElement.setAttribute('data-theme', savedTheme);

      let userTodos: Record<number, boolean[]> = savedTodos || {};
      if (data && Object.keys(userTodos).length === 0) {
        data.itinerario.forEach((g) => {
          userTodos[g.giorno] = g.todo_list.map((t) => t.fatto);
        });
        await saveTodos(userTodos);
      }

      const checkInsMap: Record<string, CheckIn> = {};
      if (Array.isArray(savedCheckIns)) {
        for (const c of savedCheckIns) {
          if (c && c.id) {
            checkInsMap[c.id] = c;
          }
        }
      }

      const checkInPhotosMap: Record<string, string> = {};
      if (Array.isArray(savedCheckInPhotos)) {
        for (const p of savedCheckInPhotos) {
          if (p && p.id && p.blob) {
            checkInPhotosMap[p.id] = URL.createObjectURL(p.blob);
          }
        }
      }

      const selectedDay = data ? calculateCurrentTripDay(data.itinerario) : 0;

      // Load GiPSigo config from IndexedDB
      let gipsigoConfig: GiPSigoConfig | null = null;
      try {
        gipsigoConfig = (await getGiPSigoConfig()) || null;
      } catch (_) { /* silent */ }

      set({
        data: data || null,
        userTodos,
        userLogs: savedLogs || {},
        dailyJournals: savedJournals || {},
        customTodos: savedCustomTodos || {},
        customRates: savedCustomRates || null,
        theme: savedTheme,
        checkIns: checkInsMap,
        checkInPhotos: checkInPhotosMap,
        selectedDay,
        gipsigoConfig,
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

  updateGiPSigoConfig: async (updates: Partial<GiPSigoConfig>) => {
    const current = get().gipsigoConfig;
    const merged: GiPSigoConfig = {
      enabled: false,
      apiKey: '',
      tripToken: '',
      endpointUrl: '',
      ...current,
      ...updates,
    };
    await saveGiPSigoConfig(merged);
    set({ gipsigoConfig: merged });
  },

  markCheckInsSyncedGiPSigo: async (checkInIds: string[]) => {
    await dbMarkCheckInsSynced(checkInIds);
    const now = Date.now();
    set((state) => {
      const updated = { ...state.checkIns };
      for (const id of checkInIds) {
        if (updated[id]) {
          updated[id] = { ...updated[id], syncedToGiPSigo: true, syncedAt: now };
        }
      }
      const config = state.gipsigoConfig
        ? { ...state.gipsigoConfig, lastSyncAt: now }
        : null;
      return { checkIns: updated, gipsigoConfig: config };
    });
  },
}));
