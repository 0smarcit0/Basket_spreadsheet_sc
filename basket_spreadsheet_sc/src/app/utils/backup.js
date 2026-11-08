// Exportación / importación de torneos, equipos y respaldo de la aplicación.
// Todos los archivos son .txt con JSON: { formato, version, tipo, exportadoEn, ... }

const FORMATO = "BS_EXPORT"
const VERSION = 1

// Claves de localStorage que NO entran en el respaldo ni se tocan al restaurarlo
// (contienen la sal y el hash de acceso: no deben viajar en un archivo compartible).
export const CLAVES_EXCLUIDAS = ["auth_credentials"]

const clave = (s) => String(s ?? "").trim().toLowerCase()

// 2026-11-05 (fecha local)
export function fechaArchivo() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function descargarTxt(nombreBase, contenido) {
  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${nombreBase}.txt`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return `${nombreBase}.txt`
}

const construir = (tipo, datos) =>
  JSON.stringify({ formato: FORMATO, version: VERSION, tipo, exportadoEn: new Date().toISOString(), ...datos }, null, 2)

/* ───────────── Exportar ───────────── */
export const exportarTorneosTxt = (torneos) =>
  descargarTxt(`EXPORT_TORNEOS_${fechaArchivo()}`, construir("torneos", { torneos }))

// equipos: [{ torneoOrigen, nombreequipo, roster, cuerpotecnico }]
export const exportarEquiposTxt = (equipos) =>
  descargarTxt(`EXPORT_EQUIPOS_${fechaArchivo()}`, construir("equipos", { equipos }))

export function leerLocalStorage() {
  const out = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!CLAVES_EXCLUIDAS.includes(k)) out[k] = localStorage.getItem(k)
  }
  return out
}


export const exportarAppTxt = (torneos) =>
  descargarTxt(`BACKUP_BS_${fechaArchivo()}`, construir("app", { localStorage: leerLocalStorage(), torneos }))

/* ───────────── Importar: lectura y validación de formato ───────────── */
function leerEnvoltorio(texto, tipoEsperado) {
  let data
  try {
    data = JSON.parse(texto)
  } catch {
    throw new Error("El archivo no contiene datos válidos (no se pudo interpretar su contenido).")
  }
  if (data?.formato !== FORMATO) {
    throw new Error("El archivo no tiene el formato esperado. Usa un archivo generado por esta aplicación.")
  }
  if (data.tipo !== tipoEsperado) {
    throw new Error(`Este archivo es una exportación de «${data.tipo}», no de ${tipoEsperado}.`)
  }
  return data
}

// Devuelve la lista cruda de torneos o equipos (se valida a fondo al importar).
export function parseExport(texto, tipo) {
  const lista = leerEnvoltorio(texto, tipo)[tipo]
  if (!Array.isArray(lista) || lista.length === 0) {
    throw new Error("El archivo no contiene información para importar.")
  }
  return lista
}

export function parseBackupApp(texto) {
  const data = leerEnvoltorio(texto, "app")
  const local = data.localStorage
  const torneos = data.torneos
  if (!local || typeof local !== "object" || Array.isArray(local) || !Array.isArray(torneos)) {
    throw new Error("El respaldo está incompleto o dañado.")
  }
  const limpio = {}
  for (const [k, v] of Object.entries(local)) {
    if (typeof v === "string" && !CLAVES_EXCLUIDAS.includes(k)) limpio[k] = v
  }
  if (Object.keys(limpio).length === 0 && torneos.length === 0) {
    throw new Error("El respaldo no contiene información.")
  }
  return { local: limpio, torneos }
}

// Reemplaza el localStorage (salvo las claves excluidas) por el contenido del respaldo.
export function restaurarLocalStorage(local) {
  const claves = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
  claves.filter((k) => !CLAVES_EXCLUIDAS.includes(k)).forEach((k) => localStorage.removeItem(k))
  Object.entries(local).forEach(([k, v]) => localStorage.setItem(k, v))
}

// Nombres de `nuevos` que ya existen en `existentes` (sin distinguir mayúsculas).
export function nombresRepetidos(nuevos, existentes) {
  const set = new Set(existentes.map(clave))
  const vistos = new Set()
  const out = []
  for (const n of nuevos) {
    const k = clave(n)
    if (k && set.has(k) && !vistos.has(k)) {
      vistos.add(k)
      out.push(String(n).trim())
    }
  }
  return out
}