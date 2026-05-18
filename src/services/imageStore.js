const DB_NAME  = "serveflow_images";
const STORE    = "product_images";
const VERSION  = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE);
    req.onsuccess       = (e) => resolve(e.target.result);
    req.onerror         = (e) => reject(e.target.error);
  });
}

export const imageStore = {
  async save(productId, base64) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(base64, String(productId));
      tx.oncomplete = resolve;
      tx.onerror    = reject;
    });
  },

  async get(productId) {
    const db = await openDB();
    return new Promise((resolve) => {
      const req = db.transaction(STORE).objectStore(STORE).get(String(productId));
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror   = () => resolve(null);
    });
  },

  async getMany(productIds) {
    const db = await openDB();
    const store = db.transaction(STORE).objectStore(STORE);
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
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(String(productId));
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
