"use client"
import { useEffect } from "react"
import { useMatchStore } from "../store/matchStore"
import { saveSheet } from "../saveSheet"

const DEBOUNCE_MS = 800 // tiempo sin cambios antes de guardar
const SETTLE_MS = 500 // ignora los eventos del propio montaje (reset, valores por defecto...)

/**
 * Guarda la planilla automáticamente cuando cambia el formulario o el store.
 *
 * @param methods  el objeto que devuelve useForm()
 * @param enabled  poner en `ready`: no se activa hasta que la planilla esté cargada
 */
export default function useAutosave(methods, enabled) {
    
  const { watch, getValues } = methods

  useEffect(() => {
    if (!enabled) return

    let armed = false // false durante el montaje, para no guardar una planilla vacía encima de la guardada
    let dirty = false // hay cambios sin guardar
    let timer = null

    const flush = () => {
      clearTimeout(timer)
      timer = null
      if (!dirty) return
      dirty = false
      try {
        saveSheet(getValues(), useMatchStore.getState())
      } catch (err) {
        console.error("Autoguardado falló:", err)
      }
    }

    // Debounce: cada cambio reinicia la espera, así se escribe una vez al terminar de teclear
    const schedule = () => {
      if (!armed) return
      dirty = true
      clearTimeout(timer)
      timer = setTimeout(flush, DEBOUNCE_MS)
    }

    const armTimer = setTimeout(() => {
      armed = true
    }, SETTLE_MS)

    // watch(callback) se suscribe a los cambios sin provocar re-renders
    const formSub = watch(schedule)
    const unsubscribeStore = useMatchStore.subscribe(schedule)

    // Móvil/PWA: al pasar a segundo plano el navegador puede matar la app sin avisar.
    // localStorage es síncrono, así que escribir aquí sí es fiable.
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush()
    }
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("pagehide", flush)

    return () => {
      clearTimeout(armTimer)
      formSub.unsubscribe()
      unsubscribeStore()
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pagehide", flush)
      flush() // al salir de la planilla se guarda lo pendiente
    }
  }, [enabled])
}