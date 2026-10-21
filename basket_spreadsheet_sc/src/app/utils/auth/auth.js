const DB_NAME = "app_auth"
const STORE = "auth"
const RECORD_KEY = "device_authorization"
const SESSION_KEY = "auth_session_id"



const ITERATIONS = 210000
const SALT_B64 = "DJT6q3314rqaBMSyeVCirw=="
const EXPECTED_HASH_B64 = "x/yaIaDLHNkZEZ6I7cFYkuFARAb+cYNfPICLC6qISTs="

const enc = new TextEncoder()
const fromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))

async function deriveHash(username, password) {
  // Usuario normalizado + contraseña exacta, así tampoco el usuario aparece en el código
  const input = `${username.trim().toUpperCase()}:${password}`
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(input), "PBKDF2", false, ["deriveBits"]
  )
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: fromB64(SALT_B64), iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256
  )
  return new Uint8Array(bits)
}

// Comparación en tiempo constante
function safeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}


function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// Ejecuta una operación en una transacción y devuelve su resultado al completarse
async function run(mode, op) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = op(tx.objectStore(STORE))
    tx.oncomplete = () => { db.close(); resolve(req.result) }
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error) }
  })
}

export async function checkCredentials(username, password) {
  try {
    const derived = await deriveHash(username, password)
    return safeEqual(derived, fromB64(EXPECTED_HASH_B64))
  } catch {
    return false
  }
}

export async function authorizeDevice() {
  const sessionId = crypto.randomUUID()
  sessionStorage.setItem(SESSION_KEY, sessionId)
  await run("readwrite", (s) =>
    s.put({ authorized: true, sessionId, authorizedAt: Date.now() }, RECORD_KEY)
  )
}

export async function isAuthorized() {
  try {
    const record = await run("readonly", (s) => s.get(RECORD_KEY))
    if (!record) return false

    const sessionId = sessionStorage.getItem(SESSION_KEY)
    if (record.authorized && sessionId && record.sessionId === sessionId) return true

    // La app se cerró y se volvió a abrir: la autorización quedó huérfana, se borra
    await clearAuthorization()
    return false
  } catch {
    return false
  }
}

export async function clearAuthorization() {
  sessionStorage.removeItem(SESSION_KEY)
  try {
    await run("readwrite", (s) => s.delete(RECORD_KEY))
  } catch {
    /* sin acceso a IndexedDB: nada que borrar */
  }
}