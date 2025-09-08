import type { GenerationHistoryEntry } from '../types';

const DB_NAME = 'ImageGenerationDB';
const DB_VERSION = 1;
const HISTORY_STORE_NAME = 'generation-history';

let db: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject('Error opening database');
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            if (!tempDb.objectStoreNames.contains(HISTORY_STORE_NAME)) {
                const store = tempDb.createObjectStore(HISTORY_STORE_NAME, { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp');
            }
        };
    });
};

export const addHistoryEntry = async (entry: GenerationHistoryEntry): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(HISTORY_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(HISTORY_STORE_NAME);
        store.put(entry);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const addMultipleHistoryEntries = async (entries: GenerationHistoryEntry[]): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(HISTORY_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(HISTORY_STORE_NAME);
        entries.forEach(entry => store.put(entry));
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getAllHistory = async (): Promise<GenerationHistoryEntry[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(HISTORY_STORE_NAME, 'readonly');
        const store = transaction.objectStore(HISTORY_STORE_NAME);
        const index = store.index('timestamp');
        const request = index.getAll();
        
        request.onsuccess = () => {
            resolve(request.result.reverse());
        };
        request.onerror = () => reject(request.error);
    });
};

export const deleteHistoryEntry = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(HISTORY_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(HISTORY_STORE_NAME);
        store.delete(id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};
