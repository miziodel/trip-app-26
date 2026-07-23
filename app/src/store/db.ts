import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { ViaggioData, TravelLog, DailyJournal, CheckIn, CheckInPhoto, GiPSigoConfig } from '../types/viaggio';

export interface CustomRates {
  JPY_EUR: number;
  KRW_EUR: number;
}

interface ViaggioDBSchema extends DBSchema {
  config: {
    key: string;
    value: ViaggioData | Record<number, boolean[]> | 'day' | 'night' | GiPSigoConfig;
  };
  logs: {
    key: string;
    value: Record<string, TravelLog>;
  };
  customRates: {
    key: string;
    value: CustomRates;
  };
  customTodos: {
    key: string;
    value: Record<number, string[]>;
  };
  journals: {
    key: number;
    value: DailyJournal;
  };
  checkins: {
    key: string;
    value: CheckIn;
  };
  checkin_photos: {
    key: string;
    value: CheckInPhoto;
  };
}

const DB_NAME = 'viaggio-db';
const DB_VERSION = 4;

let dbPromise: Promise<IDBPDatabase<ViaggioDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<ViaggioDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<ViaggioDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config');
        }
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs');
        }
        if (!db.objectStoreNames.contains('customRates')) {
          db.createObjectStore('customRates');
        }
        if (!db.objectStoreNames.contains('customTodos')) {
          db.createObjectStore('customTodos');
        }
        if (!db.objectStoreNames.contains('journals')) {
          db.createObjectStore('journals');
        }
        if (!db.objectStoreNames.contains('checkins')) {
          db.createObjectStore('checkins');
        }
        if (!db.objectStoreNames.contains('checkin_photos')) {
          db.createObjectStore('checkin_photos');
        }
      },
      blocked() {
        console.warn('IndexedDB upgrade blocked by another tab. Force closing...');
      },
      blocking() {
        console.warn('IndexedDB blocking another connection. Closing...');
      },
    });
  }
  return dbPromise;
}

export async function saveViaggioData(data: ViaggioData): Promise<void> {
  const db = await getDB();
  await db.put('config', data, 'data');
}

export async function getViaggioData(): Promise<ViaggioData | undefined> {
  const db = await getDB();
  const data = await db.get('config', 'data');
  return data as ViaggioData | undefined;
}

export async function saveTodos(todos: Record<number, boolean[]>): Promise<void> {
  const db = await getDB();
  await db.put('config', todos, 'todos');
}

export async function getTodos(): Promise<Record<number, boolean[]> | undefined> {
  const db = await getDB();
  const todos = await db.get('config', 'todos');
  return todos as Record<number, boolean[]> | undefined;
}

export async function saveLogs(logs: Record<string, TravelLog>): Promise<void> {
  const db = await getDB();
  await db.put('logs', logs, 'logs');
}

export async function saveLog(itemKey: string, log: TravelLog): Promise<void> {
  const currentLogs = (await getLogs()) || {};
  const updatedLogs: Record<string, TravelLog> = {
    ...currentLogs,
    [itemKey]: {
      ...currentLogs[itemKey],
      ...log,
      updatedAt: Date.now(),
    },
  };
  await saveLogs(updatedLogs);
}

export async function getLogs(): Promise<Record<string, TravelLog>> {
  const db = await getDB();
  const logs = await db.get('logs', 'logs');
  return (logs as Record<string, TravelLog>) || {};
}

export async function saveJournal(journal: DailyJournal): Promise<void> {
  const db = await getDB();
  await db.put('journals', journal, journal.giorno);
}

export async function saveJournals(journals: Record<number, DailyJournal>): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('journals', 'readwrite');
  for (const key of Object.keys(journals)) {
    const giornoNum = Number(key);
    await tx.store.put(journals[giornoNum], giornoNum);
  }
  await tx.done;
}

export async function getJournals(): Promise<Record<number, DailyJournal>> {
  const db = await getDB();
  const allJournals = await db.getAll('journals');
  const result: Record<number, DailyJournal> = {};
  for (const j of allJournals) {
    if (j && typeof j.giorno === 'number') {
      result[j.giorno] = j;
    }
  }
  return result;
}

export async function saveCustomRates(rates: CustomRates): Promise<void> {
  const db = await getDB();
  await db.put('customRates', rates, 'rates');
}

export async function getCustomRates(): Promise<CustomRates | undefined> {
  const db = await getDB();
  const rates = await db.get('customRates', 'rates');
  return rates as CustomRates | undefined;
}

export async function saveCustomTodos(todos: Record<number, string[]>): Promise<void> {
  const db = await getDB();
  await db.put('customTodos', todos, 'todos');
}

export async function getCustomTodos(): Promise<Record<number, string[]> | undefined> {
  const db = await getDB();
  const todos = await db.get('customTodos', 'todos');
  return todos as Record<number, string[]> | undefined;
}

export async function saveTheme(theme: 'day' | 'night'): Promise<void> {
  const db = await getDB();
  await db.put('config', theme as any, 'theme');
}

export async function getTheme(): Promise<'day' | 'night' | undefined> {
  const db = await getDB();
  const theme = await db.get('config', 'theme');
  return theme as ('day' | 'night') | undefined;
}

export async function saveCheckIn(checkin: CheckIn): Promise<void> {
  const db = await getDB();
  await db.put('checkins', checkin, checkin.id);
}

export async function getCheckIns(): Promise<CheckIn[]> {
  const db = await getDB();
  return db.getAll('checkins');
}

export async function deleteCheckIn(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('checkins', id);
}

export async function updateCheckIn(checkInId: string, updates: Partial<CheckIn>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('checkins', checkInId);
  if (!existing) return;
  const updated = { ...existing, ...updates };
  await db.put('checkins', updated, checkInId);
}

export async function markCheckInsSynced(checkInIds: string[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('checkins', 'readwrite');
  const now = Date.now();
  for (const id of checkInIds) {
    const existing = await tx.store.get(id);
    if (existing) {
      existing.syncedToGiPSigo = true;
      existing.syncedAt = now;
      await tx.store.put(existing, id);
    }
  }
  await tx.done;
}

export async function getPendingCheckIns(): Promise<CheckIn[]> {
  const db = await getDB();
  const all = await db.getAll('checkins');
  return all.filter((c) => !c.syncedToGiPSigo);
}

export async function saveGiPSigoConfig(config: GiPSigoConfig): Promise<void> {
  const db = await getDB();
  await db.put('config', config, 'gipsigo_config');
}

export async function getGiPSigoConfig(): Promise<GiPSigoConfig | undefined> {
  const db = await getDB();
  const config = await db.get('config', 'gipsigo_config');
  return config as GiPSigoConfig | undefined;
}

export async function saveCheckInPhoto(photo: CheckInPhoto): Promise<void> {
  const db = await getDB();
  await db.put('checkin_photos', photo, photo.id);
}

export async function getCheckInPhotos(): Promise<CheckInPhoto[]> {
  const db = await getDB();
  return db.getAll('checkin_photos');
}

export async function deleteCheckInPhoto(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('checkin_photos', id);
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const stores = ['config', 'logs', 'customRates', 'customTodos', 'journals', 'checkins', 'checkin_photos'] as const;
  for (const store of stores) {
    if (db.objectStoreNames.contains(store)) {
      await db.clear(store);
    }
  }
}
