import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { ViaggioData, TravelLog } from '../types/viaggio';

export interface CustomRates {
  JPY_EUR: number;
  KRW_EUR: number;
}

interface ViaggioDBSchema extends DBSchema {
  config: {
    key: string;
    value: ViaggioData | Record<number, boolean[]>;
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
}

const DB_NAME = 'viaggio-db';
const DB_VERSION = 2;

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

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const stores = ['config', 'logs', 'customRates', 'customTodos'] as const;
  for (const store of stores) {
    if (db.objectStoreNames.contains(store)) {
      await db.clear(store);
    }
  }
}

