import { WatchlistItem, PriceAlert } from '../types';

const DB_NAME = 'stockwatch_db';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains('watchlist')) {
        const watchlistStore = database.createObjectStore('watchlist', { keyPath: 'id' });
        watchlistStore.createIndex('user_id', 'user_id', { unique: false });
      }

      if (!database.objectStoreNames.contains('alerts')) {
        const alertsStore = database.createObjectStore('alerts', { keyPath: 'id' });
        alertsStore.createIndex('user_id', 'user_id', { unique: false });
        alertsStore.createIndex('ticker', 'ticker', { unique: false });
      }

      if (!database.objectStoreNames.contains('users')) {
        const usersStore = database.createObjectStore('users', { keyPath: 'id' });
        usersStore.createIndex('email', 'email', { unique: true });
      }
    };
  });
}

// User management
export async function createUser(id: string, email: string, name?: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    store.add({ id, email, name, created_at: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getUserByEmail(email: string): Promise<{ id: string; email: string; name?: string } | null> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    const index = store.index('email');
    const request = index.get(email);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function getUserById(id: string): Promise<{ id: string; email: string; name?: string } | null> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

// Watchlist management
export async function addToWatchlist(item: Omit<WatchlistItem, 'id' | 'added_at'>): Promise<WatchlistItem> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('watchlist', 'readwrite');
    const store = tx.objectStore('watchlist');
    const newItem: WatchlistItem = {
      ...item,
      id: crypto.randomUUID(),
      added_at: new Date().toISOString(),
    };
    store.add(newItem);
    tx.oncomplete = () => resolve(newItem);
    tx.onerror = () => reject(tx.error);
  });
}

export async function removeFromWatchlist(id: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('watchlist', 'readwrite');
    const store = tx.objectStore('watchlist');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getWatchlist(userId: string): Promise<WatchlistItem[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('watchlist', 'readonly');
    const store = tx.objectStore('watchlist');
    const index = store.index('user_id');
    const request = index.getAll(userId);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function isInWatchlist(userId: string, ticker: string): Promise<boolean> {
  const items = await getWatchlist(userId);
  return items.some(item => item.ticker.toUpperCase() === ticker.toUpperCase());
}

// Alert management
export async function createAlert(alert: Omit<PriceAlert, 'id' | 'created_at' | 'is_triggered'>): Promise<PriceAlert> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('alerts', 'readwrite');
    const store = tx.objectStore('alerts');
    
    // Delete existing alert for same ticker if any
    const index = store.index('user_id');
    const getAllRequest = index.getAll(alert.user_id);
    
    getAllRequest.onsuccess = () => {
      const existingAlerts = getAllRequest.result as PriceAlert[];
      const existingAlert = existingAlerts.find(a => a.ticker === alert.ticker);
      
      if (existingAlert) {
        store.delete(existingAlert.id);
      }
      
      const newAlert: PriceAlert = {
        ...alert,
        id: crypto.randomUUID(),
        is_triggered: false,
        created_at: new Date().toISOString(),
      };
      store.add(newAlert);
      tx.oncomplete = () => resolve(newAlert);
      tx.onerror = () => reject(tx.error);
    };
    
    getAllRequest.onerror = () => reject(getAllRequest.error);
  });
}

export async function updateAlert(alert: PriceAlert): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('alerts', 'readwrite');
    const store = tx.objectStore('alerts');
    store.put(alert);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteAlert(id: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('alerts', 'readwrite');
    const store = tx.objectStore('alerts');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAlertsForUser(userId: string): Promise<PriceAlert[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('alerts', 'readonly');
    const store = tx.objectStore('alerts');
    const index = store.index('user_id');
    const request = index.getAll(userId);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getAlertForTicker(userId: string, ticker: string): Promise<PriceAlert | null> {
  const alerts = await getAlertsForUser(userId);
  return alerts.find(a => a.ticker.toUpperCase() === ticker.toUpperCase()) || null;
}
