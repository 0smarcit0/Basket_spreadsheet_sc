"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { emparejar, validarConfig, barajar, calcularTabla, torneoTerminado, TIPO_LEADERBOARD } from "../torneoLogic"

/* ───────────── Persistencia en OPFS ─────────────
   Archivo: INFO_TORNEOS.TXT
   { "torneos": [ { nombretorneo, equipos: [ { nombreequipo, roster, cuerpotecnico } ] } ] }
*/
const FILE_NAME = "INFO_TORNEOS.TXT"

const arr = (x) => (Array.isArray(x) ? x : [])
const str = (x) => String(x ?? "")

export function normalizarEquipo(e) {
  return {
    nombreequipo: str(e?.nombreequipo),
    roster: arr(e?.roster).map((j) => ({ dorsal: str(j?.dorsal), nombre: str(j?.nombre), cedula: str(j?.cedula) })),
    cuerpotecnico: arr(e?.cuerpotecnico).map((m) => ({ nombre: str(m?.nombre), cedula: str(m?.cedula), cargo: str(m?.cargo) })),
  }
}

const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0)
const nuevoId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function normalizarConfig(c) {
  if (!c || typeof c !== "object") return null
  return {
    tipo: c.tipo === "standard" ? "standard" : "leaderboard",
    partidosEntreEquipos: ["1", "2", "mejor3"].includes(String(c.partidosEntreEquipos)) ? String(c.partidosEntreEquipos) : "1",
    equiposPorGrupo: c.equiposPorGrupo == null ? null : num(c.equiposPorGrupo) || null,
    clasificadosPorGrupo: c.clasificadosPorGrupo == null ? null : num(c.clasificadosPorGrupo) || null,
    iniciadoEn: str(c.iniciadoEn),
  }
}

function normalizarPartido(p) {
  const resultado =
    p?.resultado && typeof p.resultado === "object"
      ? {
          puntosA: num(p.resultado.puntosA),
          puntosB: num(p.resultado.puntosB),
          registradoEn: str(p.resultado.registradoEn),
          // inasistencia (D.3): "A" | "B" | "both" | null
          forfeit: ["A", "B", "both"].includes(p.resultado.forfeit) ? p.resultado.forfeit : null,
        }
      : null
  return {
    id: str(p?.id) || nuevoId(),
    equipoA: str(p?.equipoA),
    equipoB: str(p?.equipoB),
    estado: p?.estado === "jugado" && resultado ? "jugado" : "programado",
    resultado: p?.estado === "jugado" ? resultado : null,
  }
}

function normalizarJornada(j) {
  return {
    id: str(j?.id) || nuevoId(),
    numero: num(j?.numero),
    estado: j?.estado === "finalizada" ? "finalizada" : "activa",
    creadaEn: str(j?.creadaEn),
    partidos: arr(j?.partidos).map(normalizarPartido),
  }
}

export function normalizarTorneo(t) {
  const config = normalizarConfig(t?.config)
  return {
    nombretorneo: str(t?.nombretorneo),
    equipos: arr(t?.equipos).map(normalizarEquipo),
    config,
    jornadas: config ? arr(t?.jornadas).map(normalizarJornada) : [],
    // orden del sorteo de desempate (D.1.3); null si no se hizo
    sorteo: config && Array.isArray(t?.sorteo) ? t.sorteo.map(str) : null,
  }
}

async function getFileHandle() {
  if (typeof navigator === "undefined" || !navigator.storage?.getDirectory) {
    throw new Error("Este navegador no soporta OPFS.")
  }
  const root = await navigator.storage.getDirectory()
  return root.getFileHandle(FILE_NAME, { create: true })
}

async function cargarTorneos() {
  const handle = await getFileHandle()
  const texto = await (await handle.getFile()).text()
  if (!texto.trim()) return []
  const data = JSON.parse(texto) // si está dañado lanza error (el hook lo maneja)
  const lista = Array.isArray(data) ? data : data?.torneos
  if (!Array.isArray(lista)) throw new Error("Formato inesperado en " + FILE_NAME)
  return lista.map(normalizarTorneo)
}

// Cola de escritura: evita que dos guardados simultáneos se pisen.
let cola = Promise.resolve()
function guardarTorneos(torneos) {
  const tarea = cola
    .catch(() => {})
    .then(async () => {
      const handle = await getFileHandle()
      const writable = await handle.createWritable()
      try {
        await writable.write(JSON.stringify({ torneos }, null, 2))
        await writable.close()
      } catch (err) {
        await writable.abort().catch(() => {})
        throw err
      }
    })
  cola = tarea
  return tarea
}

/* ───────────── Validaciones ─────────────
   - Cédulas: únicas en TODO el torneo (jugadores + cuerpo técnico, todos los equipos).
   - Dorsales: únicos dentro de cada equipo. Pon true para que sean únicos en todo el torneo. */
const DORSAL_UNICO_EN_TORNEO = false

// Límites de un equipo y cargos permitidos del cuerpo técnico (la planilla tiene 1 coach y 1 asistente)
export const MAX_JUGADORES = 12
export const MAX_CUERPO_TECNICO = 2
export const CARGO_COACH = "Coach"
export const CARGO_ASISTENTE = "Coach asistente"
export const CARGOS = [CARGO_COACH, CARGO_ASISTENTE]

export const equipoVacio = () => ({
  nombreequipo: "",
  roster: [{ dorsal: "", nombre: "", cedula: "" }],
  cuerpotecnico: [{ nombre: "", cedula: "", cargo: "" }],
})

const norm = (s) => String(s ?? "").trim()
const clave = (s) => norm(s).toLowerCase()
const filaVacia = (fila) => Object.values(fila).every((v) => !norm(v))

export function equipoTieneDatos(eq) {
  return !!norm(eq.nombreequipo) || eq.roster.some((f) => !filaVacia(f)) || eq.cuerpotecnico.some((f) => !filaVacia(f))
}

// Recorta espacios y descarta filas totalmente vacías.
export function limpiarEquipo(eq) {
  return {
    nombreequipo: norm(eq.nombreequipo),
    roster: eq.roster.filter((f) => !filaVacia(f)).map((f) => ({ dorsal: norm(f.dorsal), nombre: norm(f.nombre), cedula: norm(f.cedula) })),
    cuerpotecnico: eq.cuerpotecnico.filter((f) => !filaVacia(f)).map((f) => ({ nombre: norm(f.nombre), cedula: norm(f.cedula), cargo: norm(f.cargo) })),
  }
}

// `equipo` ya limpio; `otros` = demás equipos del torneo. Devuelve mensaje de error o null.
export function validarEquipo(equipo, otros = []) {
  if (!equipo.nombreequipo) return "El nombre del equipo es obligatorio."
  if (otros.some((e) => clave(e.nombreequipo) === clave(equipo.nombreequipo))) {
    return "Ya existe un equipo con ese nombre en este torneo."
  }
  if (equipo.roster.length === 0) return "Agrega al menos un jugador."
  if (equipo.roster.length > MAX_JUGADORES) return `Un equipo puede tener máximo ${MAX_JUGADORES} jugadores.`
  if (equipo.cuerpotecnico.length > MAX_CUERPO_TECNICO) {
    return `El cuerpo técnico puede tener máximo ${MAX_CUERPO_TECNICO} integrantes.`
  }

  for (const [i, j] of equipo.roster.entries()) {
    if (!j.dorsal || !j.nombre || !j.cedula) return `Jugador ${i + 1}: completa dorsal, nombre y cédula.`
    // El input de dorsal de la planilla es numérico (0-99): evita cargar valores que quedarían vacíos allí
    if (!/^\d{1,2}$/.test(j.dorsal)) return `Jugador ${i + 1}: el dorsal debe ser un número de 0 a 99.`
  }
  for (const [i, m] of equipo.cuerpotecnico.entries()) {
    if (!m.nombre || !m.cedula || !m.cargo) return `Cuerpo técnico ${i + 1}: completa nombre, cédula y cargo.`
    if (!CARGOS.includes(m.cargo)) return `Cuerpo técnico ${i + 1}: el cargo debe ser «${CARGO_COACH}» o «${CARGO_ASISTENTE}».`
  }
  const cargos = equipo.cuerpotecnico.map((m) => m.cargo)
  if (new Set(cargos).size !== cargos.length) return "No puede haber dos integrantes con el mismo cargo."

  const dorsales = new Set(DORSAL_UNICO_EN_TORNEO ? otros.flatMap((e) => e.roster.map((j) => clave(j.dorsal))) : [])
  for (const j of equipo.roster) {
    if (dorsales.has(clave(j.dorsal))) return `El dorsal ${j.dorsal} está repetido.`
    dorsales.add(clave(j.dorsal))
  }

  const cedulas = new Set(otros.flatMap((e) => [...e.roster, ...e.cuerpotecnico].map((p) => clave(p.cedula))))
  for (const p of [...equipo.roster, ...equipo.cuerpotecnico]) {
    if (cedulas.has(clave(p.cedula))) return `La cédula ${p.cedula} está repetida.`
    cedulas.add(clave(p.cedula))
  }
  return null
}

/* ───────────── Hook ─────────────
   Las operaciones de escritura devuelven { ok: boolean, error?: string } */
export default function useTorneos() {
  const [torneos, setTorneos] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState("")

  const ref = useRef([]) // copia síncrona para evitar closures obsoletos
  const bloqueado = useRef(false) // true si el archivo no se pudo leer: no se sobreescribe

  useEffect(() => {
    let cancelado = false
    cargarTorneos()
      .then((data) => {
        if (cancelado) return
        ref.current = data
        setTorneos(data)
      })
      .catch((err) => {
        if (cancelado) return
        console.error(err)
        bloqueado.current = true
        setLoadError("No se pudo leer INFO_TORNEOS.TXT (archivo dañado o navegador sin soporte OPFS). Los cambios están deshabilitados para no perder datos.")
      })
      .finally(() => {
        if (!cancelado) setLoaded(true)
      })
    return () => {
      cancelado = true
    }
  }, [])

  const commit = useCallback(async (next) => {
    if (bloqueado.current) return { ok: false, error: "El almacenamiento no está disponible." }
    const previo = ref.current
    ref.current = next
    setTorneos(next)
    try {
      await guardarTorneos(next)
      return { ok: true }
    } catch (err) {
      console.error(err)
      ref.current = previo
      setTorneos(previo)
      return { ok: false, error: "No se pudo guardar en INFO_TORNEOS.TXT." }
    }
  }, [])

  // torneo = { nombretorneo, equipos: [...] }
  const addTorneo = useCallback(
    async (torneo) => {
      const nombre = norm(torneo?.nombretorneo)
      if (!nombre) return { ok: false, error: "El nombre del torneo no puede estar vacío." }
      if (ref.current.some((t) => clave(t.nombretorneo) === clave(nombre))) return { ok: false, error: "Ese torneo ya existe." }
      return commit([...ref.current, { nombretorneo: nombre, equipos: arr(torneo?.equipos), config: null, jornadas: [], sorteo: null }])
    },
    [commit]
  )

  const renameTorneo = useCallback(
    async (viejo, nuevo) => {
      const limpio = norm(nuevo)
      if (!limpio) return { ok: false, error: "El nombre no puede estar vacío." }
      if (ref.current.some((t) => t.nombretorneo !== viejo && clave(t.nombretorneo) === clave(limpio))) {
        return { ok: false, error: "Ese torneo ya existe." }
      }
      return commit(ref.current.map((t) => (t.nombretorneo === viejo ? { ...t, nombretorneo: limpio } : t)))
    },
    [commit]
  )

  const removeTorneo = useCallback((nombre) => commit(ref.current.filter((t) => t.nombretorneo !== nombre)), [commit])

  const updateEquipo = useCallback(
    async (nombreTorneo, nombreEquipoViejo, equipoNuevo) => {
      const torneo = ref.current.find((t) => t.nombretorneo === nombreTorneo)
      if (!torneo) return { ok: false, error: "El torneo no existe." }

      const limpio = limpiarEquipo(equipoNuevo)
      const error = validarEquipo(limpio, torneo.equipos.filter((e) => e.nombreequipo !== nombreEquipoViejo))
      if (error) return { ok: false, error }

      // Si cambió el nombre del equipo, se actualiza también en los partidos de las jornadas
      const renombrado = limpio.nombreequipo !== nombreEquipoViejo
      const renombrar = (n) => (n === nombreEquipoViejo ? limpio.nombreequipo : n)
      return commit(
        ref.current.map((t) =>
          t !== torneo
            ? t
            : {
                ...t,
                equipos: t.equipos.map((e) => (e.nombreequipo === nombreEquipoViejo ? limpio : e)),
                jornadas: !renombrado
                  ? t.jornadas
                  : t.jornadas.map((j) => ({
                      ...j,
                      partidos: j.partidos.map((p) => ({ ...p, equipoA: renombrar(p.equipoA), equipoB: renombrar(p.equipoB) })),
                    })),
                sorteo: t.sorteo ? t.sorteo.map(renombrar) : t.sorteo,
              }
        )
      )
    },
    [commit]
  )

  // Agrega un equipo nuevo a un torneo ya creado
  const addEquipo = useCallback(
    async (nombreTorneo, equipoNuevo) => {
      const torneo = ref.current.find((t) => t.nombretorneo === nombreTorneo)
      if (!torneo) return { ok: false, error: "El torneo no existe." }

      if (torneo.config) return { ok: false, error: "El torneo ya inició: no se pueden agregar más equipos." }

      const limpio = limpiarEquipo(equipoNuevo)
      const error = validarEquipo(limpio, torneo.equipos)
      if (error) return { ok: false, error }

      return commit(ref.current.map((t) => (t !== torneo ? t : { ...t, equipos: [...t.equipos, limpio] })))
    },
    [commit]
  )

  // Importa torneos desde un archivo (lista cruda). Los de igual nombre se sobrescriben en su posición.
  // Todo o nada: si algún equipo no pasa las validaciones, no se importa nada.
  const importTorneos = useCallback(
    async (lista) => {
      const nuevos = []
      for (const crudo of arr(lista)) {
        const t = normalizarTorneo(crudo)
        const nombre = norm(t.nombretorneo)
        if (!nombre) return { ok: false, error: "Hay un torneo sin nombre en el archivo." }
        if (nuevos.some((n) => clave(n.nombretorneo) === clave(nombre))) {
          return { ok: false, error: `El torneo «${nombre}» aparece repetido en el archivo.` }
        }
        const equipos = []
        for (const e of t.equipos) {
          const limpio = limpiarEquipo(e)
          const error = validarEquipo(limpio, equipos)
          if (error) {
            return { ok: false, error: `Torneo «${nombre}», equipo «${limpio.nombreequipo || "sin nombre"}»: ${error}` }
          }
          equipos.push(limpio)
        }
        const nombresEq = new Set(equipos.map((e) => e.nombreequipo))
        for (const j of t.jornadas) {
          for (const p of j.partidos) {
            if (!nombresEq.has(p.equipoA) || !nombresEq.has(p.equipoB) || p.equipoA === p.equipoB) {
              return { ok: false, error: `Torneo «${nombre}»: la jornada ${j.numero} usa equipos que no existen en el torneo.` }
            }
          }
        }
        nuevos.push({ nombretorneo: nombre, equipos, config: t.config, jornadas: t.jornadas, sorteo: t.sorteo })
      }
      if (nuevos.length === 0) return { ok: false, error: "El archivo no contiene torneos." }

      const porClave = new Map(nuevos.map((t) => [clave(t.nombretorneo), t]))
      const usados = new Set()
      const actualizados = ref.current.map((t) => {
        const k = clave(t.nombretorneo)
        const n = porClave.get(k)
        if (!n) return t
        usados.add(k)
        return n
      })
      return commit([...actualizados, ...nuevos.filter((t) => !usados.has(clave(t.nombretorneo)))])
    },
    [commit]
  )

  // Importa equipos (lista cruda) a un torneo. Los equipos con el mismo nombre se sobrescriben.
  const importEquipos = useCallback(
    async (nombreTorneo, lista) => {
      const torneo = ref.current.find((t) => t.nombretorneo === nombreTorneo)
      if (!torneo) return { ok: false, error: "El torneo no existe." }

      const entrantes = arr(lista).map((e) => limpiarEquipo(normalizarEquipo(e)))
      if (entrantes.length === 0) return { ok: false, error: "El archivo no contiene equipos." }

      if (torneo.config) {
        const existentes = new Set(torneo.equipos.map((e) => clave(e.nombreequipo)))
        const nuevo = entrantes.find((e) => !existentes.has(clave(e.nombreequipo)))
        if (nuevo) {
          return { ok: false, error: `El torneo ya inició: no se puede agregar el equipo «${nuevo.nombreequipo}». Solo se pueden sobrescribir equipos existentes.` }
        }
      }

      // Los equipos existentes que se van a sobrescribir no cuentan al validar nombres y cédulas
      const nombres = new Set(entrantes.map((e) => clave(e.nombreequipo)))
      const restantes = torneo.equipos.filter((e) => !nombres.has(clave(e.nombreequipo)))

      const aceptados = []
      for (const e of entrantes) {
        const error = validarEquipo(e, [...restantes, ...aceptados])
        if (error) return { ok: false, error: `Equipo «${e.nombreequipo || "sin nombre"}»: ${error}` }
        aceptados.push(e)
      }

      const porClave = new Map(aceptados.map((e) => [clave(e.nombreequipo), e]))
      const usados = new Set()
      const reemplazados = torneo.equipos.map((e) => {
        const k = clave(e.nombreequipo)
        const n = porClave.get(k)
        if (!n) return e
        usados.add(k)
        return n
      })
      const equipos = [...reemplazados, ...aceptados.filter((e) => !usados.has(clave(e.nombreequipo)))]
      return commit(ref.current.map((t) => (t !== torneo ? t : { ...t, equipos })))
    },
    [commit]
  )

  /* ───────────── Manejo del torneo ───────────── */
  const actualizarTorneo = (torneo, cambios) =>
    commit(ref.current.map((t) => (t !== torneo ? t : { ...t, ...cambios })))

  // Comienza el torneo: guarda la configuración (ya no se podrán agregar equipos)
  const iniciarTorneo = useCallback(
    async (nombreTorneo, config) => {
      const torneo = ref.current.find((t) => t.nombretorneo === nombreTorneo)
      if (!torneo) return { ok: false, error: "El torneo no existe." }
      if (torneo.config) return { ok: false, error: "El torneo ya fue iniciado." }
      if (torneo.equipos.length < 2) return { ok: false, error: "Se necesitan al menos 2 equipos para comenzar el torneo." }
      const error = validarConfig(config, torneo.equipos.length)
      if (error) return { ok: false, error }

      const standard = config.tipo === "standard"
      return actualizarTorneo(torneo, {
        config: {
          tipo: config.tipo,
          partidosEntreEquipos: config.partidosEntreEquipos,
          equiposPorGrupo: standard ? Number(config.equiposPorGrupo) : null,
          clasificadosPorGrupo: standard ? Number(config.clasificadosPorGrupo) : null,
          iniciadoEn: new Date().toISOString(),
        },
        jornadas: [],
      })
    },
    [commit]
  )

  // Leaderboard: crea una jornada con `cantidad` partidos aleatorios entre equipos que aún deben enfrentarse
  const generarJornada = useCallback(
    async (nombreTorneo, cantidad) => {
      const torneo = ref.current.find((t) => t.nombretorneo === nombreTorneo)
      if (!torneo) return { ok: false, error: "El torneo no existe." }
      if (!torneo.config) return { ok: false, error: "El torneo aún no ha iniciado." }
      if (torneo.config.tipo !== TIPO_LEADERBOARD) return { ok: false, error: "Esta opción solo está disponible en el formato Leaderboard." }
      if (torneo.jornadas.some((j) => j.estado === "activa")) {
        return { ok: false, error: "Finaliza la jornada activa antes de generar otra." }
      }

      const n = Number(cantidad)
      const max = Math.floor(torneo.equipos.length / 2)
      if (!Number.isInteger(n) || n < 1 || n > max) {
        return { ok: false, error: `La cantidad de partidos debe ser un entero entre 1 y ${max}.` }
      }

      const nombres = torneo.equipos.map((e) => e.nombreequipo)
      const pares = emparejar(nombres, torneo.jornadas, torneo.config.partidosEntreEquipos, n)
      if (pares.length === 0) return { ok: false, error: "Ya no quedan emparejamientos disponibles: todos los equipos jugaron entre sí." }
      if (pares.length < n) {
        return {
          ok: false,
          error: `Solo se pudieron generar ${pares.length} ${pares.length === 1 ? "partido" : "partidos"} con los emparejamientos disponibles (un equipo no juega dos veces en la misma jornada). Reduce la cantidad.`,
        }
      }

      const jornada = {
        id: nuevoId(),
        numero: torneo.jornadas.length + 1,
        estado: "activa",
        creadaEn: new Date().toISOString(),
        partidos: pares.map(([a, b]) => ({ id: nuevoId(), equipoA: a, equipoB: b, estado: "programado", resultado: null })),
      }
      return actualizarTorneo(torneo, { jornadas: [...torneo.jornadas, jornada] })
    },
    [commit]
  )

  // Solo si todos los partidos de la jornada ya tienen resultado
  const finalizarJornada = useCallback(
    async (nombreTorneo, jornadaId) => {
      const torneo = ref.current.find((t) => t.nombretorneo === nombreTorneo)
      const jornada = torneo?.jornadas.find((j) => j.id === jornadaId)
      if (!jornada) return { ok: false, error: "La jornada no existe." }
      if (jornada.estado !== "activa") return { ok: false, error: "La jornada ya fue finalizada." }
      const pendientes = jornada.partidos.filter((p) => p.estado !== "jugado").length
      if (pendientes > 0) return { ok: false, error: `Aún faltan ${pendientes} partidos por completar.` }

      return actualizarTorneo(torneo, {
        jornadas: torneo.jornadas.map((j) => (j.id === jornadaId ? { ...j, estado: "finalizada" } : j)),
      })
    },
    [commit]
  )

  // Se llama al terminar una planilla vinculada a un partido del torneo
  const registrarResultado = useCallback(
    async (nombreTorneo, partidoId, puntosA, puntosB, forfeit = null) => {
      const torneo = ref.current.find((t) => t.nombretorneo === nombreTorneo)
      if (!torneo) return { ok: false, error: "El torneo ya no existe." }
      const jornada = torneo.jornadas.find((j) => j.partidos.some((p) => p.id === partidoId))
      const partido = jornada?.partidos.find((p) => p.id === partidoId)
      if (!partido) return { ok: false, error: "El partido ya no existe en el torneo." }
      if (jornada.estado !== "activa") return { ok: false, error: "La jornada de este partido ya fue finalizada." }
      if (partido.estado === "jugado") return { ok: false, error: "Este partido ya tiene un resultado registrado." }

      const resultado = {
        puntosA: num(puntosA),
        puntosB: num(puntosB),
        registradoEn: new Date().toISOString(),
        forfeit: ["A", "B", "both"].includes(forfeit) ? forfeit : null, // inasistencia: "A" | "B" | "both"
      }
      return actualizarTorneo(torneo, {
        jornadas: torneo.jornadas.map((j) =>
          j.id !== jornada.id
            ? j
            : { ...j, partidos: j.partidos.map((p) => (p.id === partidoId ? { ...p, estado: "jugado", resultado } : p)) }
        ),
      })
    },
    [commit]
  )

  // D.1.3: si al terminar el torneo quedan equipos empatados que ningún criterio resuelve, se define por sorteo
  const realizarSorteo = useCallback(
    async (nombreTorneo) => {
      const torneo = ref.current.find((t) => t.nombretorneo === nombreTorneo)
      if (!torneo) return { ok: false, error: "El torneo no existe." }
      if (!torneoTerminado(torneo)) return { ok: false, error: "El sorteo solo puede realizarse cuando el torneo haya finalizado." }
      if (torneo.sorteo) return { ok: false, error: "El sorteo ya fue realizado." }
      if (!calcularTabla(torneo).some((f) => f.empate)) return { ok: false, error: "No hay empates que requieran sorteo." }

      return actualizarTorneo(torneo, { sorteo: barajar(torneo.equipos.map((e) => e.nombreequipo)) })
    },
    [commit]
  )

  // Restauración de respaldo: reemplaza TODOS los torneos. También sirve si el archivo estaba dañado.
  const reemplazarTodo = useCallback(
    async (lista) => {
      bloqueado.current = false
      setLoadError("")
      return commit(arr(lista).map(normalizarTorneo))
    },
    [commit]
  )

  return {
    torneos, loaded, loadError,
    addTorneo, renameTorneo, removeTorneo, updateEquipo, addEquipo,
    importTorneos, importEquipos, reemplazarTodo,
    iniciarTorneo, generarJornada, finalizarJornada, registrarResultado, realizarSorteo,
  }
}