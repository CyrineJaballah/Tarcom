/**
 * Simplified IndexedDB wrapper for persisting submissions with files.
 */
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
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TarcomDB', 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      store.put(data);

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getPendingSubmissions(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TarcomDB', 1);

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('queue')) {
        return resolve([]);
      }
      const transaction = db.transaction(['queue'], 'readonly');
      const store = transaction.objectStore('queue');
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function removePendingSubmission(id: string) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TarcomDB', 1);

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      store.delete(id);

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    };

    request.onerror = () => reject(request.error);
  });
}
