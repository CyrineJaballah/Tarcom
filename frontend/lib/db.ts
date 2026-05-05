/**
 * Simplified IndexedDB wrapper for persisting submissions with files.
 */

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Bumping version to 2 to ensure onupgradeneeded fires if the store is missing
    const request = indexedDB.open('TarcomDB', 2);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function savePendingSubmission(data: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fiche: File | null;
  documents: Record<string, File>;
  timestamp: number;
}) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains('queue')) {
      return reject(new Error("Object store 'queue' not found"));
    }
    const transaction = db.transaction(['queue'], 'readwrite');
    const store = transaction.objectStore('queue');
    store.put(data);

    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getPendingSubmissions(): Promise<any[]> {
  try {
    const db = await initDB();
    if (!db.objectStoreNames.contains('queue')) {
      return [];
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['queue'], 'readonly');
      const store = transaction.objectStore('queue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("IndexedDB error:", error);
    return [];
  }
}

export async function removePendingSubmission(id: string) {
  const db = await initDB();
  if (!db.objectStoreNames.contains('queue')) {
    return true; // Nothing to remove
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['queue'], 'readwrite');
    const store = transaction.objectStore('queue');
    store.delete(id);

    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
}
