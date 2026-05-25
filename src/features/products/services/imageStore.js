const DB_NAME = 'serveflow_images';
const IMAGES  = 'product_images';
const PENDING = 'pending_uploads';
const VERSION = 2;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IMAGES))  db.createObjectStore(IMAGES);
      if (!db.objectStoreNames.contains(PENDING)) db.createObjectStore(PENDING);
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

export const imageStore = {
  async save(productId, base64) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IMAGES, 'readwrite');
      tx.objectStore(IMAGES).put(base64, String(productId));
      tx.oncomplete = resolve;
      tx.onerror    = reject;
    });
  },

  async get(productId) {
    const db = await openDB();
    return new Promise((resolve) => {
      const req = db.transaction(IMAGES).objectStore(IMAGES).get(String(productId));
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror   = () => resolve(null);
    });
  },

  async getMany(productIds) {
    const db = await openDB();
    const store = db.transaction(IMAGES).objectStore(IMAGES);
    const results = {};
    await Promise.all(
      productIds.map(
        (id) =>
          new Promise((resolve) => {
            const req = store.get(String(id));
            req.onsuccess = () => { results[id] = req.result ?? null; resolve(); };
            req.onerror   = () => { results[id] = null; resolve(); };
          })
      )
    );
    return results;
  },

  async remove(productId) {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IMAGES, 'readwrite');
      tx.objectStore(IMAGES).delete(String(productId));
      tx.oncomplete = resolve;
      tx.onerror    = resolve;
    });
  },
};

export const pendingUploads = {
  async enqueue(base64, fileName, mimeType) {
    const db  = await openDB();
    const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PENDING, 'readwrite');
      tx.objectStore(PENDING).put({ base64, fileName, mimeType }, key);
      tx.oncomplete = () => resolve(key);
      tx.onerror    = reject;
    });
  },

  async get(key) {
    const db = await openDB();
    return new Promise((resolve) => {
      const req = db.transaction(PENDING).objectStore(PENDING).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror   = () => resolve(null);
    });
  },

  async dequeue(key) {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(PENDING, 'readwrite');
      tx.objectStore(PENDING).delete(key);
      tx.oncomplete = resolve;
      tx.onerror    = resolve;
    });
  },
};

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror   = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToFile(base64, fileName, mimeType) {
  const byteString = atob(base64.split(',')[1]);
  const buffer     = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) buffer[i] = byteString.charCodeAt(i);
  return new File([buffer], fileName, { type: mimeType });
}
