// Formato Standard: grupos + eliminación directa (Reglas Oficiales FIBA 2026, Apéndice D).
// Todo son funciones puras sobre el objeto `torneo`; el hook solo guarda lo que ellas calculan.
import {
  TIPO_STANDARD,
  TIPO_LEADERBOARD,
  ganador,
  barajar,
  nuevoId,
  potenciaDe2,
  tamanosGrupos,
  partidosVigentes,
  estadisticas,
  aplanarBloques,
  construirTabla,
  paresDisponibles,
  emparejarPares,
  jornadaActiva,
  retiradosSet,
  equiposActivos,
  ganadorSerieIdaVuelta,
  maxPartidosPorJornada,
  torneoTerminado,
  calcularTabla,
} from "./torneoLogic"

export const FASE_GRUPOS = "grupos"
export const FASE_TERCER_PUESTO = "tercer_puesto"
export const FASE_FINAL = "final"

const NOMBRE_RONDA = { 2: FASE_FINAL, 4: "semifinales", 8: "cuartos", 16: "octavos", 32: "dieciseisavos" }
const ETIQUETAS = {
  grupos: "Grupos",
  dieciseisavos: "Dieciseisavos",
  octavos: "Octavos",
  cuartos: "Cuartos",
  semifinales: "Semifinales",
  tercer_puesto: "Tercer puesto",
  final: "Final",
}
export const etiquetaFase = (f) => ETIQUETAS[f] ?? f

const alfa = (a, b) => a.localeCompare(b, "es")
const faseDe = (p) => p.fase ?? FASE_GRUPOS
const enGrupos = (p) => faseDe(p) === FASE_GRUPOS
const todosLosPartidos = (torneo) => torneo.jornadas.flatMap((j) => j.partidos)

export const partidosDeFase = (torneo, fase) =>
  todosLosPartidos(torneo)
    .filter((p) => faseDe(p) === fase)
    .sort((a, b) => (a.llave ?? 0) - (b.llave ?? 0))

/* ───────────── Grupos ───────────── */
export function nombreGrupo(i) {
  const letra = String.fromCharCode(65 + (i % 26))
  const vuelta = Math.floor(i / 26)
  return vuelta ? `${letra}${vuelta + 1}` : letra
}

// Grupos aleatorios de `porGrupo` equipos. Los que sobran se reparten de a uno por grupo
// (en orden aleatorio de grupos), no todos en el mismo.
export function generarGrupos(nombres, porGrupo) {
  const mezclados = barajar(nombres)
  const g = Math.floor(nombres.length / porGrupo)
  const grupos = Array.from({ length: g }, (_, i) => mezclados.slice(i * porGrupo, (i + 1) * porGrupo))
  const sobrantes = mezclados.slice(g * porGrupo)
  const orden = barajar(Array.from({ length: g }, (_, i) => i))
  sobrantes.forEach((n, i) => grupos[orden[i % g]].push(n))
  return grupos.map((equipos, i) => ({ nombre: nombreGrupo(i), equipos }))
}

export const grupoDe = (torneo, equipo) => torneo.grupos?.find((g) => g.equipos.includes(equipo))?.nombre ?? null

export function etiquetaPartido(torneo, p) {
  const f = faseDe(p)
  if (f !== FASE_GRUPOS) {
    const serie = (torneo.config?.partidosEliminatoria ?? "1") !== "1"
    return serie ? `${etiquetaFase(f)} · Juego ${p.juego ?? 1}` : etiquetaFase(f)
  }
  const g = torneo.config?.tipo === TIPO_STANDARD ? grupoDe(torneo, p.equipoA) : null
  return g ? `Grupos (${g})` : "Grupos"
}

// Tablas de posiciones de cada grupo (D.1 + D.3). `terminado`: el grupo ya jugó todo lo que debía.
export function tablasGrupos(torneo) {
  const { vigentes, anulados, inasistencias, retirados } = partidosVigentes(torneo)
  const vigGrupos = vigentes.filter(enGrupos)
  const jornadasGrupos = torneo.jornadas.map((j) => ({ ...j, partidos: j.partidos.filter(enGrupos) }))
  const modo = torneo.config.partidosEntreEquipos

  return torneo.grupos.map((g) => {
    const miembros = new Set(g.equipos)
    const activos = g.equipos.filter((n) => !retirados.has(n)) // los retirados ya no juegan
    const pendientes = jornadasGrupos.some((j) =>
      j.partidos.some((p) => miembros.has(p.equipoA) && p.estado === "programado")
    )
    const terminado = !pendientes && paresDisponibles(activos, jornadasGrupos, modo).length === 0
    const filas = construirTabla({
      nombres: g.equipos,
      partidos: vigGrupos,
      anulados,
      retirados,
      inasistencias,
      sorteo: torneo.sorteo,
      marcarEmpates: terminado,
    })
    return { nombre: g.nombre, equipos: g.equipos, filas, terminado }
  })
}

export const faseGruposTerminada = (torneo) =>
  torneo.grupos.length > 0 && tablasGrupos(torneo).every((t) => t.terminado)

// Parejas de grupo que aún deben jugar (solo dentro de cada grupo)
export function paresDisponiblesGrupos(torneo) {
  const jornadasGrupos = torneo.jornadas.map((j) => ({ ...j, partidos: j.partidos.filter(enGrupos) }))
  const ret = retiradosSet(torneo)
  return torneo.grupos.flatMap((g) =>
    paresDisponibles(g.equipos.filter((n) => !ret.has(n)), jornadasGrupos, torneo.config.partidosEntreEquipos)
  )
}

/* ───────────── Criterios en cascada ───────────── */
// valores(n) -> [criterio1, criterio2, ...] (mayor es mejor). Equipos con todos los valores iguales quedan en el mismo bloque.
function bloquesPorCriterios(lista, valores) {
  const igual = (a, b) => a.every((v, i) => v === b[i])
  const orden = [...lista].sort((a, b) => {
    const va = valores(a)
    const vb = valores(b)
    for (let i = 0; i < va.length; i++) if (va[i] !== vb[i]) return vb[i] - va[i]
    return 0
  })
  const bloques = []
  for (const n of orden) {
    const g = bloques[bloques.length - 1]
    if (g && igual(valores(g[0]), valores(n))) g.push(n)
    else bloques.push([n])
  }
  return bloques
}

/* ───────────── D.4: clasificación cruzada entre grupos ─────────────
   Compara a los equipos que quedaron en la misma `posicion` de cada grupo.
   D.4.2: si jugaron distinto número de partidos, se anulan los del último clasificado de los grupos
          con más partidos (y se repite) hasta igualarlos. Eso cubre también D.3.3: un grupo al que
          se le anuló un equipo tiene menos partidos y los demás se ajustan.
   Criterios (D.4.1): récord (puntos de clasificación), diferencia y puntos anotados en las tablas revisadas.
   Sin resolver -> sorteo (se ignora el ranking FIBA). */
export function clasificacionCruzada(torneo, posicion, tablas = tablasGrupos(torneo)) {
  const { vigentes } = partidosVigentes(torneo)
  const vigGrupos = vigentes.filter(enGrupos)

  const cands = []
  for (const t of tablas) {
    const orden = t.filas.filter((f) => !f.anulado).map((f) => f.equipo)
    if (orden[posicion - 1]) cands.push({ grupo: t.nombre, equipo: orden[posicion - 1], orden, removidos: new Set() })
  }
  const stats = (c) => estadisticas(vigGrupos, new Set(c.orden.filter((n) => !c.removidos.has(n)))).get(c.equipo)

  for (let guard = 0; guard < 200 && cands.length > 1; guard++) {
    const conteos = cands.map((c) => stats(c).pj)
    const max = Math.max(...conteos)
    if (max === Math.min(...conteos)) break
    let cambio = false
    cands.forEach((c, i) => {
      if (conteos[i] !== max) return
      const idx = c.orden.indexOf(c.equipo)
      const ultimo = [...c.orden].reverse().find((n) => !c.removidos.has(n) && c.orden.indexOf(n) > idx)
      if (ultimo) {
        c.removidos.add(ultimo)
        cambio = true
      }
    })
    if (!cambio) break
  }

  const datos = new Map(cands.map((c) => [c.equipo, { grupo: c.grupo, ...stats(c) }]))
  const bloques = bloquesPorCriterios(cands.map((c) => c.equipo), (n) => {
    const s = datos.get(n)
    return [s.pts, s.pf - s.pc, s.pf]
  })
  return aplanarBloques(bloques, torneo.sorteo, true).map((f) => {
    const s = datos.get(f.equipo)
    return { ...f, grupo: s.grupo, posicion, pj: s.pj, pg: s.pg, pp: s.pp, pf: s.pf, pc: s.pc, pts: s.pts, dif: s.pf - s.pc }
  })
}

/* ───────────── Eliminatoria: clasificados, llave y emparejamientos ───────────── */
export function fasesDeLlave(tamano, conTercerPuesto) {
  const fases = []
  for (let s = tamano; s >= 2; s /= 2) fases.push(NOMBRE_RONDA[s])
  if (conTercerPuesto && tamano >= 4) fases.splice(fases.length - 1, 0, FASE_TERCER_PUESTO)
  return fases
}

// Tamaño de la llave y fases previstas con la configuración (antes de generarla)
export function llavePrevista(torneo) {
  const tamano = potenciaDe2(torneo.grupos.length * torneo.config.clasificadosPorGrupo)
  return { tamano, fases: fasesDeLlave(tamano, torneo.config.juegoTercerPuesto === true) }
}

// Quiénes pasan y con qué semilla. Si clasifican menos de los que pide la llave (potencia de 2),
// se completa con los mejores del puesto siguiente de cada grupo, ordenados con D.4.
// `empate`: hay empates sin resolver que afectan (se necesita el sorteo antes de generar).
export function planEliminatoria(torneo) {
  const c = torneo.config.clasificadosPorGrupo
  const g = torneo.grupos.length
  const base = g * c
  const tamano = potenciaDe2(base)
  const faltan = tamano - base
  const tablas = tablasGrupos(torneo)
  let empate = tablas.some((t) => t.filas.some((f) => f.empate))

  const clasificados = []
  for (let pos = 1; pos <= c + (faltan > 0 ? 1 : 0); pos++) {
    const orden = clasificacionCruzada(torneo, pos, tablas)
    const tomar = pos <= c ? orden.length : Math.min(faltan, orden.length)
    // en el puesto de relleno solo importan los empates dentro de los elegidos o en el límite
    if (orden.some((r, i) => r.empate && (pos <= c || i <= tomar))) empate = true
    orden.slice(0, tomar).forEach((r) => clasificados.push({ equipo: r.equipo, grupo: r.grupo, posicion: pos }))
  }

  const error =
    clasificados.length !== tamano
      ? "No hay suficientes equipos válidos en los grupos para completar la llave (hay equipos con resultados anulados)."
      : null
  return { tamano, clasificados: clasificados.map((x, i) => ({ ...x, semilla: i + 1 })), empate, error }
}

// Orden de semillas en la llave: [1,8,4,5,2,7,3,6] para 8 (1 y 2 solo se cruzan en la final)
function ordenLlave(tamano) {
  let r = [1, 2]
  while (r.length < tamano) {
    const n = r.length * 2
    r = r.flatMap((s) => [s, n + 1 - s])
  }
  return r
}

// Primera ronda: 1 vs último, 2 vs penúltimo... evitando (si se puede) cruces entre equipos del mismo grupo.
// El mejor sembrado figura como equipo A.
export function emparejarLlave(clasificados) {
  const porSemilla = new Map(clasificados.map((c) => [c.semilla, c]))
  const orden = ordenLlave(clasificados.length)
  const pares = []
  for (let i = 0; i < orden.length; i += 2) pares.push([porSemilla.get(orden[i]), porSemilla.get(orden[i + 1])])

  const choque = ([a, b]) => a.grupo === b.grupo
  for (let i = 0; i < pares.length; i++) {
    if (!choque(pares[i])) continue
    const candidatos = []
    for (let d = 1; d < pares.length; d++) {
      if (i + d < pares.length) candidatos.push(i + d)
      if (i - d >= 0) candidatos.push(i - d)
    }
    for (const j of candidatos) {
      const [a1, b1] = pares[i]
      const [a2, b2] = pares[j]
      if (a1.grupo !== b2.grupo && a2.grupo !== b1.grupo) {
        pares[i] = [a1, b2]
        pares[j] = [a2, b1]
        break
      }
    }
  }
  return pares.map(([a, b]) => ({ equipoA: a.equipo, equipoB: b.equipo }))
}

/* ───────────── Series de la eliminatoria (1 partido, ida y vuelta o mejor de 3) ─────────────
   Una llave = dos equipos en una fase. Cada partido guarda `llave` (posición en la fase) y `juego` (n.º en la serie).
   Local: juego 1 y 3 el equipo A (mejor sembrado), juego 2 el equipo B.
   - "1": gana quien gane el partido.
   - "ida_vuelta": D.6, gana quien gane los dos partidos o, si ganan uno cada uno, el mayor global de puntos.
                   Si el global queda empatado, el 2.º partido debe seguir con tiempos extra (no se puede avanzar).
   - "mejor3": gana quien llegue a 2 victorias (el 3.er juego solo si quedó 1-1).
   Retiro voluntario: si la llave aún no estaba decidida, avanza el rival. */
export const MAX_JUEGOS = { 1: 1, ida_vuelta: 2, mejor3: 3 }
const modoEliminatoria = (torneo) => torneo.config?.partidosEliminatoria ?? "1"
export const perdedorDe = (llave) => (llave.ganador === llave.equipoA ? llave.equipoB : llave.equipoA)

export function estadoLlave(torneo, fase, llave) {
  const modo = modoEliminatoria(torneo)
  const partidos = partidosDeFase(torneo, fase)
    .filter((p) => p.llave === llave)
    .sort((a, b) => (a.juego ?? 1) - (b.juego ?? 1))
  if (partidos.length === 0) return null

  const A = partidos[0].equipoA
  const B = partidos[0].equipoB
  const jugados = partidos.filter((p) => p.estado === "jugado" && p.resultado)
  const victorias = { [A]: 0, [B]: 0 }
  const global = { [A]: 0, [B]: 0 }
  for (const p of jugados) {
    const g = ganador(p)
    if (g) victorias[g]++
    global[p.equipoA] += p.resultado.puntosA
    global[p.equipoB] += p.resultado.puntosB
  }
  const e = {
    fase, llave, equipoA: A, equipoB: B, partidos, victorias, global,
    pendiente: partidos.some((p) => p.estado === "programado"),
    ganador: null, decidida: false, retiro: null, problema: null, siguienteJuego: null,
  }

  // 1) resultado por los partidos jugados
  if (modo === "1") {
    if (jugados.length === 1) {
      const g = ganador(jugados[0])
      if (g) Object.assign(e, { ganador: g, decidida: true })
      else e.problema = "El partido terminó sin ganador."
    }
  } else if (modo === "ida_vuelta") {
    if (jugados.length === 2) {
      const r = ganadorSerieIdaVuelta(
        ...jugados.map((p) => ({
          equipoA: p.equipoA, equipoB: p.equipoB, puntosA: p.resultado.puntosA, puntosB: p.resultado.puntosB, ganador: ganador(p),
        }))
      )
      if (r.ganador) Object.assign(e, { ganador: r.ganador, decidida: true })
      else e.problema = "El global quedó empatado: el segundo partido debe continuar con tiempos extra hasta desempatar (D.6.3)."
    }
  } else {
    const g = [A, B].find((n) => victorias[n] >= 2)
    if (g) Object.assign(e, { ganador: g, decidida: true })
    else if (jugados.length >= 3) e.problema = "La serie terminó sin ganador."
  }

  // 2) retiro voluntario: si no estaba decidida, avanza el rival
  if (!e.decidida) {
    const ret = retiradosSet(torneo)
    if (ret.has(A) || ret.has(B)) {
      e.decidida = true
      if (ret.has(A) && ret.has(B)) {
        e.problema = "Ambos equipos se retiraron: no hay equipo que avance."
      } else {
        e.problema = null
        e.retiro = ret.has(A) ? A : B
        e.ganador = ret.has(A) ? B : A
      }
      return e
    }
  }

  // 3) ¿falta programar otro juego de la serie?
  if (!e.decidida && !e.pendiente && !e.problema && partidos.length < MAX_JUEGOS[modo]) {
    e.siguienteJuego = partidos.length + 1
  }
  return e
}

export function llavesDeFase(torneo, fase) {
  const ids = [...new Set(partidosDeFase(torneo, fase).map((p) => p.llave ?? 0))].sort((a, b) => a - b)
  return ids.map((l) => estadoLlave(torneo, fase, l)).filter(Boolean)
}

// Fase principal más avanzada ya generada (la final arrastra al tercer puesto) y sus llaves
function contextoPaso(torneo) {
  const elim = torneo.eliminatoria
  const ko = elim.fases.filter((f) => f !== FASE_TERCER_PUESTO)
  const generadas = new Set(todosLosPartidos(torneo).map(faseDe))
  const ultimo = ko.reduce((acc, f, i) => (generadas.has(f) ? i : acc), -1)
  if (ultimo < 0) return null
  const faseActual = ko[ultimo]
  const fasesDelPaso =
    faseActual === FASE_FINAL && elim.fases.includes(FASE_TERCER_PUESTO) ? [FASE_TERCER_PUESTO, FASE_FINAL] : [faseActual]
  return { ko, ultimo, faseActual, llaves: fasesDelPaso.flatMap((f) => llavesDeFase(torneo, f)) }
}

// Texto del botón de «siguiente paso» de la eliminatoria
export function etiquetaSiguientePaso(torneo) {
  if (!torneo.eliminatoria) return "Generar fase eliminatoria"
  const ctx = contextoPaso(torneo)
  const incompleta = ctx?.llaves.find((l) => !l.decidida && l.siguienteJuego)
  return incompleta
    ? `Generar juego ${incompleta.siguienteJuego} de ${etiquetaFase(ctx.faseActual).toLowerCase()}`
    : "Generar siguiente fase"
}

/* ───────────── Transiciones: devuelven { ok, error } o { ok: true, cambios } ───────────── */
const crearJornadaObj = (torneo, fase, partidos, juego = 1) => {
  const lista = partidos.map((p) => ({
    id: nuevoId(),
    fase: p.fase ?? fase,
    llave: p.llave ?? null,
    juego: p.juego ?? juego,
    equipoA: p.equipoA,
    equipoB: p.equipoB,
    estado: p.estado ?? "programado",
    resultado: null,
  }))
  return {
    id: nuevoId(),
    numero: torneo.jornadas.length + 1,
    fase,
    juego,
    estado: lista.some((p) => p.estado === "programado") ? "activa" : "finalizada",
    creadaEn: new Date().toISOString(),
    partidos: lista,
  }
}

// Jornada de la fase de grupos (Standard: parejas dentro de cada grupo; Leaderboard: todas)
export function crearJornada(torneo, cantidad) {
  if (!torneo.config) return { ok: false, error: "El torneo aún no ha iniciado." }
  const standard = torneo.config.tipo === TIPO_STANDARD
  if (torneo.jornadas.some((j) => j.estado === "activa")) {
    return { ok: false, error: "Finaliza la jornada activa antes de generar otra." }
  }
  if (standard && torneo.eliminatoria) return { ok: false, error: "La fase de grupos ya terminó." }

  const n = Number(cantidad)
  const max = maxPartidosPorJornada(torneo)
  if (!Number.isInteger(n) || n < 1 || n > max) {
    return { ok: false, error: `La cantidad de partidos debe ser un entero entre 1 y ${max}.` }
  }

  const candidatas = standard
    ? paresDisponiblesGrupos(torneo)
    : paresDisponibles(equiposActivos(torneo), torneo.jornadas, torneo.config.partidosEntreEquipos)
  if (candidatas.length === 0) {
    return {
      ok: false,
      error: standard
        ? "La fase de grupos ya terminó: genera la fase eliminatoria."
        : "Ya no quedan emparejamientos disponibles: todos los equipos jugaron entre sí.",
    }
  }
  const pares = emparejarPares(candidatas, torneo.jornadas, n)
  if (pares.length < n) {
    return {
      ok: false,
      error: `Solo se pudieron generar ${pares.length} ${pares.length === 1 ? "partido" : "partidos"} con los emparejamientos disponibles (un equipo no juega dos veces en la misma jornada). Reduce la cantidad.`,
    }
  }
  const jornada = crearJornadaObj(torneo, FASE_GRUPOS, pares.map(([a, b]) => ({ equipoA: a, equipoB: b })))
  return { ok: true, cambios: { jornadas: [...torneo.jornadas, jornada] } }
}

// Primera fase de la eliminatoria (si aún no existe); después, el siguiente juego de las series
// que siguen abiertas o la siguiente fase.
export function crearFaseEliminatoria(torneo) {
  if (torneo.config?.tipo !== TIPO_STANDARD) return { ok: false, error: "Solo disponible en el formato Standard." }
  if (torneo.jornadas.some((j) => j.estado === "activa")) {
    return { ok: false, error: "Finaliza la jornada activa antes de generar el siguiente paso." }
  }
  if (torneoFinalizado(torneo)) return { ok: false, error: "El torneo ya finalizó." }

  if (!torneo.eliminatoria) {
    if (!faseGruposTerminada(torneo)) return { ok: false, error: "La fase de grupos aún no ha terminado." }
    const plan = planEliminatoria(torneo)
    if (plan.error) return { ok: false, error: plan.error }
    if (plan.empate) {
      return {
        ok: false,
        error: "Hay empates que ningún criterio del reglamento resuelve: realiza el sorteo de desempate antes de generar la fase eliminatoria.",
      }
    }
    const fases = fasesDeLlave(plan.tamano, torneo.config.juegoTercerPuesto === true)
    const partidos = emparejarLlave(plan.clasificados).map((p, i) => ({ ...p, llave: i, juego: 1 }))
    return {
      ok: true,
      cambios: {
        eliminatoria: { tamano: plan.tamano, fases, clasificados: plan.clasificados },
        jornadas: [...torneo.jornadas, crearJornadaObj(torneo, fases[0], partidos)],
      },
    }
  }

  const ctx = contextoPaso(torneo)
  if (!ctx) return { ok: false, error: "La fase eliminatoria aún no tiene partidos." }
  const { ko, ultimo, faseActual, llaves } = ctx

  if (llaves.some((l) => l.pendiente)) return { ok: false, error: "Aún faltan partidos por jugar en la fase actual." }
  const conProblema = llaves.find((l) => l.problema)
  if (conProblema) return { ok: false, error: `${conProblema.equipoA} vs ${conProblema.equipoB}: ${conProblema.problema}` }

  // Series abiertas: siguiente juego de cada una
  const abiertas = llaves.filter((l) => !l.decidida)
  if (abiertas.length > 0) {
    if (abiertas.some((l) => !l.siguienteJuego)) return { ok: false, error: "No se pudo determinar el siguiente partido de la serie." }
    const partidos = abiertas.map((l) => {
      const local = l.siguienteJuego % 2 === 1
      return { fase: l.fase, llave: l.llave, juego: l.siguienteJuego, equipoA: local ? l.equipoA : l.equipoB, equipoB: local ? l.equipoB : l.equipoA }
    })
    return { ok: true, cambios: { jornadas: [...torneo.jornadas, crearJornadaObj(torneo, faseActual, partidos, abiertas[0].siguienteJuego)] } }
  }

  if (faseActual === FASE_FINAL) return { ok: false, error: "Ya se generaron todas las fases de la eliminatoria." }

  // Siguiente fase con los ganadores (y los perdedores de semifinales para el tercer puesto)
  const principales = llavesDeFase(torneo, faseActual)
  const ganadores = principales.map((l) => l.ganador)
  const perdedores = principales.map(perdedorDe)
  const ret = retiradosSet(torneo)
  const estado = (a, b) => (ret.has(a) || ret.has(b) ? "anulado" : "programado") // si alguien se retiró, avanza el rival
  const fase = ko[ultimo + 1]
  const partidos = []
  if (fase === FASE_FINAL) {
    if (torneo.eliminatoria.fases.includes(FASE_TERCER_PUESTO)) {
      partidos.push({ fase: FASE_TERCER_PUESTO, llave: 0, juego: 1, equipoA: perdedores[0], equipoB: perdedores[1], estado: estado(perdedores[0], perdedores[1]) })
    }
    partidos.push({ fase: FASE_FINAL, llave: 0, juego: 1, equipoA: ganadores[0], equipoB: ganadores[1], estado: estado(ganadores[0], ganadores[1]) })
  } else {
    for (let k = 0; k < ganadores.length; k += 2) {
      partidos.push({ fase, llave: k / 2, juego: 1, equipoA: ganadores[k], equipoB: ganadores[k + 1], estado: estado(ganadores[k], ganadores[k + 1]) })
    }
  }
  return { ok: true, cambios: { jornadas: [...torneo.jornadas, crearJornadaObj(torneo, fase, partidos)] } }
}

/* ───────────── Retiro voluntario ─────────────
   D.5.1: se anulan todos los partidos del equipo retirado (queda al final de su tabla y los demás
   conservan solo sus partidos entre sí). Sus partidos programados se anulan y no se vuelve a emparejar.
   En la eliminatoria, avanza el rival de la llave que estuviera pendiente. */
export function equiposVivos(torneo) {
  const elim = torneo.eliminatoria
  if (!elim) return new Set(equiposActivos(torneo))
  const vivos = new Set()
  const ko = elim.fases.filter((f) => f !== FASE_TERCER_PUESTO)
  const generadas = new Set(todosLosPartidos(torneo).map(faseDe))
  const conTercero = elim.fases.includes(FASE_TERCER_PUESTO)
  for (const fase of elim.fases) {
    for (const l of llavesDeFase(torneo, fase)) {
      if (!l.decidida) {
        vivos.add(l.equipoA)
        vivos.add(l.equipoB)
        continue
      }
      if (!l.ganador || fase === FASE_FINAL || fase === FASE_TERCER_PUESTO) continue
      const siguiente = ko[ko.indexOf(fase) + 1]
      if (!generadas.has(siguiente)) {
        vivos.add(l.ganador)
        if (siguiente === FASE_FINAL && conTercero) vivos.add(perdedorDe(l))
      }
    }
  }
  return vivos
}

export function equiposRetirables(torneo) {
  if (!torneo.config || torneoFinalizado(torneo)) return []
  const ret = retiradosSet(torneo)
  const candidatos = torneo.equipos.map((e) => e.nombreequipo).filter((n) => !ret.has(n))
  if (!torneo.eliminatoria) return candidatos
  const vivos = equiposVivos(torneo)
  return candidatos.filter((n) => vivos.has(n))
}

function faseActualId(torneo) {
  if (!torneo.eliminatoria) return FASE_GRUPOS
  return contextoPaso(torneo)?.faseActual ?? FASE_GRUPOS
}

export function crearRetiro(torneo, equipo) {
  if (!torneo.config) return { ok: false, error: "El torneo aún no ha iniciado." }
  if (!equiposRetirables(torneo).includes(equipo)) {
    return { ok: false, error: "Ese equipo no puede retirarse: ya fue eliminado, ya se retiró o el torneo finalizó." }
  }
  if (equiposActivos(torneo).length <= 2) {
    return { ok: false, error: "No se puede retirar el equipo: el torneo quedaría con menos de 2 equipos." }
  }
  return {
    ok: true,
    cambios: {
      retirados: [...(torneo.retirados ?? []), { equipo, fase: faseActualId(torneo), retiradoEn: new Date().toISOString() }],
      jornadas: torneo.jornadas.map((j) => ({
        ...j,
        partidos: j.partidos.map((p) =>
          p.estado === "programado" && (p.equipoA === equipo || p.equipoB === equipo) ? { ...p, estado: "anulado" } : p
        ),
      })),
    },
  }
}

/* ───────────── Fin del torneo, campeón y clasificación final ───────────── */
export function torneoFinalizado(torneo) {
  if (!torneo.config) return false
  if (torneo.config.tipo === TIPO_LEADERBOARD) return torneoTerminado(torneo)
  if (!torneo.eliminatoria) return false
  const final = estadoLlave(torneo, FASE_FINAL, 0)
  if (!final?.decidida || !final.ganador) return false
  if (torneo.eliminatoria.fases.includes(FASE_TERCER_PUESTO)) {
    const tercero = estadoLlave(torneo, FASE_TERCER_PUESTO, 0)
    if (!tercero?.decidida || !tercero.ganador) return false
  }
  return true
}

export const campeon = (torneo) => estadoLlave(torneo, FASE_FINAL, 0)?.ganador ?? null

// Posiciones finales. Campeón y subcampeón por la final; 3.º y 4.º por el partido por el tercer puesto.
// Los eliminados de una misma fase (y los que no pasaron de grupos) se ordenan según D.5.2:
// 1) mejor puesto en su grupo  2) récord  3) diferencia de puntos  4) puntos anotados (todos en la fase de grupos).
// Sin resolver -> sorteo. Los equipos retirados llevan la marca «(retirado)».
export function clasificacionFinal(torneo) {
  const tablas = tablasGrupos(torneo)
  const info = new Map()
  tablas.forEach((t) => t.filas.forEach((f) => info.set(f.equipo, { posGrupo: f.pos, pts: f.pts, dif: f.dif, pf: f.pf })))
  const final = torneoFinalizado(torneo)
  const nombres = torneo.equipos.map((e) => e.nombreequipo)
  const ret = retiradosSet(torneo)
  const criterios = (n) => {
    const i = info.get(n) ?? { posGrupo: 99, pts: 0, dif: 0, pf: 0 }
    return [-i.posGrupo, i.pts, i.dif, i.pf]
  }

  const filas = []
  const fijar = (equipo, etapa) => filas.push({ equipo, pos: filas.length + 1, etapa, empate: false, porSorteo: false })

  const fin = estadoLlave(torneo, FASE_FINAL, 0)
  if (fin?.decidida && fin.ganador) {
    fijar(fin.ganador, "Campeón")
    fijar(perdedorDe(fin), "Subcampeón")
  }
  const conTercero = torneo.eliminatoria?.fases.includes(FASE_TERCER_PUESTO)
  const tercero = conTercero ? estadoLlave(torneo, FASE_TERCER_PUESTO, 0) : null
  if (tercero?.decidida && tercero.ganador) {
    fijar(tercero.ganador, "Tercer puesto")
    fijar(perdedorDe(tercero), "Cuarto puesto")
  }

  const rondas = (torneo.eliminatoria?.fases ?? []).filter((f) => f !== FASE_FINAL && f !== FASE_TERCER_PUESTO).reverse()
  for (const fase of rondas) {
    if (fase === "semifinales" && conTercero) continue // ya clasificados por el partido por el tercer puesto
    const eliminados = llavesDeFase(torneo, fase).filter((l) => l.decidida && l.ganador).map(perdedorDe)
    aplanarBloques(bloquesPorCriterios(eliminados, criterios), torneo.sorteo, final, filas.length).forEach((f) =>
      filas.push({ ...f, etapa: `Eliminado en ${etiquetaFase(fase).toLowerCase()}` })
    )
  }

  const enLlave = new Set((torneo.eliminatoria?.clasificados ?? []).map((c) => c.equipo))
  const resto = nombres.filter((n) => !enLlave.has(n))
  aplanarBloques(bloquesPorCriterios(resto, criterios), torneo.sorteo, final, filas.length).forEach((f) =>
    filas.push({ ...f, etapa: "Eliminado en grupos" })
  )
  return filas.map((f) => (ret.has(f.equipo) ? { ...f, etapa: `${f.etapa} (retirado)` } : f))
}

/* ───────────── ¿Hay empates que solo un sorteo puede resolver? (D.1.3) ───────────── */
export function hayEmpatesSinResolver(torneo) {
  if (!torneo.config || torneo.sorteo) return false
  if (torneo.config.tipo === TIPO_LEADERBOARD) return calcularTabla(torneo).some((f) => f.empate)
  if (!faseGruposTerminada(torneo)) return false
  if (!torneo.eliminatoria) return planEliminatoria(torneo).empate
  return torneoFinalizado(torneo) && clasificacionFinal(torneo).some((f) => f.empate)
}

export { jornadaActiva }