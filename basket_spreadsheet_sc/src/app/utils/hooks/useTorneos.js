"use client"
import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "torneos"

// Lee y valida: siempre devuelve un arreglo de strings
function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === "string") : []
  } catch {
    return []
  }
}

function writeStorage(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch (err) {
    console.error("No se pudo guardar en localStorage:", err)
  }
}

export default function useTorneos() {
  const [torneos, setTorneos] = useState([])
  const [loaded, setLoaded] = useState(false)

  // Carga inicial (solo en el cliente)
  useEffect(() => {
    setTorneos(readStorage())
    setLoaded(true)
  }, [])

  // Sincroniza entre pestañas
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setTorneos(readStorage())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  // Actualiza estado y storage juntos
  const update = useCallback((updater) => {
    setTorneos((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      writeStorage(next)
      return next
    })
  }, [])

  const addTorneo = useCallback(
    (nombre) => {
      const clean = String(nombre ?? "").trim()
      if (!clean) return false
      let added = true
      update((prev) => {
        if (prev.some((t) => t.toLowerCase() === clean.toLowerCase())) {
          added = false
          return prev
        }
        return [...prev, clean]
      })
      return added
    },
    [update]
  )

  const removeTorneo = useCallback(
    (nombre) => update((prev) => prev.filter((t) => t !== nombre)),
    [update]
  )

  const clearTorneos = useCallback(() => update([]), [update])

  const updateTorneo = useCallback(
    (viejo, nuevo) => {
        const clean = String(nuevo ?? "").trim()
        if (!clean) return false
        let ok = true
        update((prev) => {
          const duplicado = prev.some(
            (t) => t !== viejo && t.toLowerCase() === clean.toLowerCase()
          )
          if (duplicado) {
            ok = false
            return prev
          }
            return prev.map((t) => (t === viejo ? clean : t))
        })
        return ok
    },
   [update]
  )

  return { torneos, loaded, addTorneo, updateTorneo, removeTorneo, clearTorneos, setTorneos: update }
}