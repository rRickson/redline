// IndexedDB persistence: 'kv' holds the document, 'blobs' holds sheet images.
// Falls back to localStorage (document only) where IndexedDB is unavailable,
// e.g. some browsers on file:// — sheets then survive only via JSON backups.

const DB_NAME = 'redline'
const KV = 'kv'
const BLOBS = 'blobs'
const LS_KEY = 'redline-doc'

let dbPromise = null

function openDb() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    let req
    try {
      req = indexedDB.open(DB_NAME, 1)
    } catch (e) {
      reject(e)
      return
    }
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(KV)) db.createObjectStore(KV)
      if (!db.objectStoreNames.contains(BLOBS)) db.createObjectStore(BLOBS)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function tx(db, store, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode)
    const req = fn(t.objectStore(store))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getDoc() {
  try {
    const db = await openDb()
    const v = await tx(db, KV, 'readonly', s => s.get('doc'))
    if (v) return JSON.parse(v)
  } catch (e) {
    const v = localStorage.getItem(LS_KEY)
    if (v) return JSON.parse(v)
  }
  return null
}

export async function setDoc(doc) {
  const s = JSON.stringify(doc)
  try {
    const db = await openDb()
    await tx(db, KV, 'readwrite', st => st.put(s, 'doc'))
  } catch (e) {
    localStorage.setItem(LS_KEY, s)
  }
}

export async function putBlob(id, blob) {
  const db = await openDb()
  await tx(db, BLOBS, 'readwrite', s => s.put(blob, id))
}

export async function getBlob(id) {
  try {
    const db = await openDb()
    return (await tx(db, BLOBS, 'readonly', s => s.get(id))) || null
  } catch (e) {
    return null
  }
}

export async function deleteBlob(id) {
  try {
    const db = await openDb()
    await tx(db, BLOBS, 'readwrite', s => s.delete(id))
  } catch (e) {}
}

export async function storageHealthy() {
  try {
    await openDb()
    return true
  } catch (e) {
    return false
  }
}
