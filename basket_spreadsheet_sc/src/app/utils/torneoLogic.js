// Lógica pura de torneos (sin React): formatos, emparejamientos y tabla de posiciones.

export const TIPO_STANDARD = "standard"
export const TIPO_LEADERBOARD = "leaderboard"

export const TIPOS = [
  { id: TIPO_STANDARD, label: "Standard (fase de grupos + eliminatoria)" },
  { id: TIPO_LEADERBOARD, label: "Leaderboard (un solo grupo)" },
]

export const FORMATOS_PARTIDOS = [
  { id: "1", label: "1 partido" },
  { id: "2", label: "2 partidos" },
  { id: "mejor3", label: "Mejor de 3" },
]
export const METODOS_JORNADAS = [
  { id: "manual", label: "Manual (genero cada jornada)" },
  { id: "automatico", label: "Automático (todo el calendario de grupos al iniciar)" },
]
export const etiquetaMetodoJornadas = (id) => METODOS_JORNADAS.find((m) => m.id === id)?.label ?? "Manual (genero cada jornada)"

// Jornadas del calendario automático: rondas del grupo más grande × vueltas (mejor de 3 arranca con 2)
export function numeroJornadasCalendario(tamanos, modo) {
  const rondas = Math.max(0, ...tamanos.map((n) => (n % 2 === 0 ? n - 1 : n)))
  return rondas * (modo === "1" ? 1 : 2)
}

// Partidos que deben jugar dos equipos en cada llave de la eliminatoria (Standard)
export const FORMATOS_ELIMINATORIA = [
  { id: "1", label: "1 partido" },
  { id: "ida_vuelta", label: "Ida y vuelta (global de puntos)" },
  { id: "mejor3", label: "Mejor de 3" },
]
export const etiquetaFormatoEliminatoria = (id) => FORMATOS_ELIMINATORIA.find((f) => f.id === id)?.label ?? id

export const etiquetaTipo = (id) => TIPOS.find((t) => t.id === id)?.label ?? id
export const etiquetaFormato = (id) => FORMATOS_PARTIDOS.find((f) => f.id === id)?.label ?? id

export const nuevoId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const MAX_LLAVE = 32 // la eliminatoria llega hasta dieciseisavos

export function potenciaDe2(n) {
  let p = 1
  while (p < n) p *= 2
  return p
}

// Tamaño de cada grupo: floor(total / porGrupo) grupos; los equipos que sobran se reparten
// de a uno por grupo (nunca varios en el mismo grupo mientras otros no tengan uno).
export function tamanosGrupos(total, porGrupo) {
  const g = Math.floor(total / porGrupo)
  const tamanos = Array(g).fill(porGrupo)
  for (let i = 0; i < total - g * porGrupo; i++) tamanos[i % g]++
  return tamanos
}

// Devuelve un mensaje de error o null.
export function validarConfig(c, totalEquipos) {
  if (!TIPOS.some((t) => t.id === c.tipo)) return "Selecciona el tipo de torneo."
  if (!FORMATOS_PARTIDOS.some((f) => f.id === c.partidosEntreEquipos)) {
    return "Selecciona la cantidad de partidos entre equipos."
  }
  if (c.generacionJornadas != null && !METODOS_JORNADAS.some((m) => m.id === c.generacionJornadas)) {
    return "Selecciona el método de generación de jornadas."
  }
  if (c.tipo === TIPO_STANDARD) {
    const p = Number(c.equiposPorGrupo);
    const q = Number(c.clasificadosPorGrupo);
    if (!Number.isInteger(p) || p < 2 || p > totalEquipos) {
      return `Los equipos por grupo deben ser un entero entre 2 y ${totalEquipos}.`;
    }
    // q === p: clasifican todos los equipos del grupo
    if (!Number.isInteger(q) || q < 1 || q > p) {
      return `Los clasificados por grupo deben ser un entero entre 1 y ${p}.`;
    }
    if (
      c.partidosEliminatoria != null &&
      !FORMATOS_ELIMINATORIA.some((f) => f.id === c.partidosEliminatoria)
    ) {
      return "Selecciona la cantidad de partidos por llave en la eliminatoria.";
    }
    const g = Math.floor(totalEquipos / p);
    const clasificados = g * q;
    if (clasificados < 2) {
      return `Con ${g} ${g === 1 ? "grupo" : "grupos"} y ${q} clasificado(s) por grupo solo avanzaría ${clasificados} equipo; la eliminatoria necesita al menos 2.`;
    }
    const llave = potenciaDe2(clasificados);
    if (llave > MAX_LLAVE) {
      return `La eliminatoria admite máximo ${MAX_LLAVE} equipos (dieciseisavos) y esta configuración clasifica ${clasificados}.`;
    }
    // Los lugares que faltan se completan con el puesto q+1 de cada grupo; solo lo tienen
    // los grupos con más de q equipos (si q === p, únicamente los que recibieron un sobrante).
    const faltan = llave - clasificados;
    const conRelleno = tamanosGrupos(totalEquipos, p).filter(
      (t) => t > q,
    ).length;
    if (faltan > conRelleno) {
      return q >= p && conRelleno === 0
        ? `Clasifican ${clasificados} equipos y la llave necesita ${llave}. Si pasan todos los equipos del grupo, la cantidad debe ser potencia de 2 (2, 4, 8, 16, 32). Reduce los clasificados o cambia los equipos por grupo.`
        : `Clasifican ${clasificados} equipos y la llave necesita ${llave}. Los ${faltan} lugares restantes se completan con los mejores ${q + 1}.º puestos de los grupos, pero solo ${conRelleno} ${conRelleno === 1 ? "grupo tiene" : "grupos tienen"} ese puesto. Ajusta los equipos por grupo o los clasificados.`;
    }
  }
  return null
}

/* ───────────── Consultas sobre un torneo ───────────── */
// Retiro voluntario: equipos que abandonaron el torneo (sus resultados se anulan, D.5.1)
export const retiradosSet = (torneo) => new Set((torneo.retirados ?? []).map((r) => r.equipo))
export const equiposActivos = (torneo) => {
  const ret = retiradosSet(torneo)
  return torneo.equipos.map((e) => e.nombreequipo).filter((n) => !ret.has(n))
}

export const jornadaActiva = (torneo) => torneo.jornadas.find((j) => j.estado === "activa") ?? null
export const jornadasActivas = (torneo) => torneo.jornadas.filter((j) => j.estado === "activa")
export const maxPartidosPorJornada = (torneo) => {
  const ret = retiradosSet(torneo)
  return torneo.config?.tipo === TIPO_STANDARD && torneo.grupos?.length
    ? torneo.grupos.reduce((suma, g) => suma + Math.floor(g.equipos.filter((n) => !ret.has(n)).length / 2), 0)
    : Math.floor(equiposActivos(torneo).length / 2)
}

// Equipo ganador del partido; null si no hay (p. ej. inasistencia de ambos equipos).
export function ganador(p) {
  if (!p.resultado) return null
  const f = p.resultado.forfeit
  if (f === "both") return null
  if (f === "A") return p.equipoB // el equipo A no se presentó
  if (f === "B") return p.equipoA
  if (p.resultado.puntosA > p.resultado.puntosB) return p.equipoA
  if (p.resultado.puntosB > p.resultado.puntosA) return p.equipoB
  return null
}

const claveParFn = (a, b) => (a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`)

// Historial por pareja: partidos asignados (programados + jugados), pendientes y victorias.
function historial(jornadas) {
  const m = new Map()
  for (const j of jornadas) {
    for (const p of j.partidos) {
      if ((p.fase ?? "grupos") !== "grupos") continue // las eliminatorias no cuentan para los emparejamientos de grupo
      const k = claveParFn(p.equipoA, p.equipoB)
      const h = m.get(k) ?? { total: 0, pendientes: 0, victorias: {}, ultimo: null }
      h.total++
      h.ultimo = p
      if (p.estado === "jugado") {
        const g = ganador(p)
        if (g) h.victorias[g] = (h.victorias[g] ?? 0) + 1
      } else if (p.estado === "programado") {
        h.pendientes++
      }
      m.set(k, h)
    }
  }
  return m
}

// ¿Esta pareja todavía debe (y puede) enfrentarse?
function puedeJugarOtraVez(modo, h) {
  if (!h) return true
  if (h.pendientes > 0) return false
  if (modo === "1") return h.total < 1
  if (modo === "2") return h.total < 2
  // Mejor de 3: el tercero solo se juega si la serie quedó 1-1
  if (h.total < 2) return true
  if (h.total === 2) return Object.keys(h.victorias).length === 2
  return false
}


export function paresDisponibles(nombres, jornadas, modo) {
  const h = historial(jornadas)
  const out = []
  for (let i = 0; i < nombres.length; i++) {
    for (let j = i + 1; j < nombres.length; j++) {
      if (puedeJugarOtraVez(modo, h.get(claveParFn(nombres[i], nombres[j])))) out.push([nombres[i], nombres[j]])
    }
  }
  return out
}

// Leaderboard terminado: hubo jornadas, ninguna activa y ya no quedan parejas por enfrentarse.
export function torneoTerminado(torneo) {
  if (torneo.config?.tipo !== TIPO_LEADERBOARD) return false
  if (torneo.jornadas.length === 0 || jornadaActiva(torneo)) return false
  return paresDisponibles(equiposActivos(torneo), torneo.jornadas, torneo.config.partidosEntreEquipos).length === 0
}

/* ───────────── Emparejamientos aleatorios ───────────── */
export function barajar(lista) {
  const a = [...lista]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Elige hasta `cantidad` partidos sin repetir equipo (un equipo juega una sola vez por jornada)
// entre las parejas candidatas `pares`. Devuelve [[equipoA, equipoB], ...]; puede devolver menos.
export function emparejarPares(pares, jornadas, cantidad) {
  const h = historial(jornadas)

  let mejor = []
  for (let intento = 0; intento < 400 && mejor.length < cantidad; intento++) {
    const usados = new Set()
    const sel = []
    for (const [a, b] of barajar(pares)) {
      if (usados.has(a) || usados.has(b)) continue
      usados.add(a)
      usados.add(b)
      sel.push([a, b])
      if (sel.length === cantidad) break
    }
    if (sel.length > mejor.length) mejor = sel
  }

  // Localía: si ya jugaron una vez, se invierte el orden del partido anterior; si no, al azar
  return mejor.map(([a, b]) => {
    const previo = h.get(claveParFn(a, b))
    if (previo?.total === 1) return [previo.ultimo.equipoB, previo.ultimo.equipoA]
    return Math.random() < 0.5 ? [a, b] : [b, a]
  })
}

// Leaderboard: todas las parejas del torneo
export function emparejar(nombres, jornadas, modo, cantidad) {
  return emparejarPares(paresDisponibles(nombres, jornadas, modo), jornadas, cantidad)
}

/* ───────────── Clasificación (Reglas Oficiales FIBA 2026, Apéndice D) ─────────────
   D.1.1  Victoria = 2 pts · derrota = 1 pt (incluida la perdida por default) · derrota por inasistencia = 0 pts.
   D.1.3  Si hay equipos con los mismos puntos, se decide solo con los partidos entre ellos:
            1) récord entre ellos  2) diferencia de puntos entre ellos  3) puntos anotados entre ellos
            4) diferencia de puntos en todos los partidos del grupo  5) puntos anotados en todos los partidos del grupo
   D.1.4  Si un criterio deja equipos ya clasificados, el procedimiento se repite desde el inicio con los restantes.
   Si nada desempata se define por sorteo (el ranking FIBA se ignora, según lo pedido).
   D.3.1  La inasistencia da 0 pts y se registra con el marcador 20-0 / 0-0 que genera la planilla.
   D.3.2  Un equipo con 2 inasistencias: se anulan todos los partidos que jugó (también para sus rivales). */

const PTS_VICTORIA = 2
const PTS_DERROTA = 1
const PTS_INASISTENCIA = 0

// Partidos jugados y vigentes (sin los anulados por D.3.2) + conteo de inasistencias por equipo
export function partidosVigentes(torneo) {
  const jugados = torneo.jornadas.flatMap((j) => j.partidos).filter((p) => p.estado === "jugado" && p.resultado)

  const inasistencias = new Map()
  const sumar = (e) => inasistencias.set(e, (inasistencias.get(e) ?? 0) + 1)
  for (const p of jugados) {
    const f = p.resultado.forfeit
    if (f === "A" || f === "both") sumar(p.equipoA)
    if (f === "B" || f === "both") sumar(p.equipoB)
  }

  const retirados = retiradosSet(torneo)
  const anulados = new Set([...inasistencias].filter(([, n]) => n >= 2).map(([e]) => e))
  retirados.forEach((e) => anulados.add(e)) // D.5.1: retiro voluntario = se anulan todos sus partidos
  const vigentes = jugados.filter((p) => !anulados.has(p.equipoA) && !anulados.has(p.equipoB))
  return { vigentes, anulados, inasistencias, retirados }
}

// Resultado de un partido desde el punto de vista de un lado ("A" | "B")
function lineaPartido(p, lado) {
  const pf = lado === "A" ? p.resultado.puntosA : p.resultado.puntosB
  const pc = lado === "A" ? p.resultado.puntosB : p.resultado.puntosA
  const f = p.resultado.forfeit
  const equipo = lado === "A" ? p.equipoA : p.equipoB
  const perdioPorInasistencia = f === "both" || f === lado
  const gano = ganador(p) === equipo
  const pts = perdioPorInasistencia ? PTS_INASISTENCIA : gano ? PTS_VICTORIA : PTS_DERROTA
  return { pf, pc, gano, pts }
}

// Estadísticas de `nombres` considerando solo los partidos jugados entre equipos de ese conjunto
export function estadisticas(partidos, nombres) {
  const m = new Map([...nombres].map((n) => [n, { pj: 0, pg: 0, pp: 0, pf: 0, pc: 0, pts: 0 }]))
  for (const p of partidos) {
    if (!m.has(p.equipoA) || !m.has(p.equipoB)) continue
    for (const lado of ["A", "B"]) {
      const s = m.get(lado === "A" ? p.equipoA : p.equipoB)
      const l = lineaPartido(p, lado)
      s.pj++
      s.pf += l.pf
      s.pc += l.pc
      s.pts += l.pts
      if (l.gano) s.pg++
      else s.pp++
    }
  }
  return m
}

// Agrupa por valor (mayor primero); los de igual valor quedan juntos
export function agruparDesc(lista, valor) {
  const orden = [...lista].sort((a, b) => valor(b) - valor(a))
  const grupos = []
  for (const t of orden) {
    const g = grupos[grupos.length - 1]
    if (g && valor(g[0]) === valor(t)) g.push(t)
    else grupos.push([t])
  }
  return grupos
}

// D.1.3 + D.1.4: ordena un grupo de equipos empatados en puntos.
// Devuelve bloques en orden; un bloque con más de un equipo = empate que ningún criterio resolvió.
function desempatar(grupo, ctx) {
  if (grupo.length === 1) return [grupo]

  const entre = estadisticas(ctx.vigentes, new Set(grupo)) // solo partidos entre ellos
  const criterios = [
    (t) => entre.get(t).pts,
    (t) => entre.get(t).pf - entre.get(t).pc,
    (t) => entre.get(t).pf,
    (t) => ctx.todos.get(t).pf - ctx.todos.get(t).pc,
    (t) => ctx.todos.get(t).pf,
  ]

  for (const valor of criterios) {
    const grupos = agruparDesc(grupo, valor)
    if (grupos.length > 1) {
      // Alguien quedó clasificado: los que siguen empatados reinician el procedimiento desde el inicio (D.1.4)
      return grupos.flatMap((g) => desempatar(g, ctx))
    }
  }
  return [grupo]
}

const alfa = (a, b) => a.localeCompare(b, "es")

// Aplana bloques de equipos (cada bloque = empatados que ningún criterio separó) en filas con posición.
// Dentro de un bloque: orden del sorteo si existe; si no, alfabético y, con `marcarEmpates`, marcados como empate
// (los empatados comparten posición).
export function aplanarBloques(bloques, sorteo, marcarEmpates, inicio = 0) {
  const ordenSorteo = new Map((sorteo ?? []).map((n, i) => [n, i]))
  const filas = []
  let usados = inicio
  for (const bloque of bloques) {
    const miembros = [...bloque].sort(alfa)
    let empate = false
    let porSorteo = false
    if (miembros.length > 1) {
      if (miembros.every((n) => ordenSorteo.has(n))) {
        miembros.sort((a, b) => ordenSorteo.get(a) - ordenSorteo.get(b))
        porSorteo = true
      } else {
        empate = marcarEmpates
      }
    }
    miembros.forEach((n, i) => {
      filas.push({ equipo: n, pos: empate ? usados + 1 : usados + i + 1, empate, porSorteo })
    })
    usados += miembros.length
  }
  return filas
}

// Tabla de un grupo. `partidos` = partidos vigentes ya filtrados a los de ese grupo/fase.
// Fila: { pos, equipo, pj, pg, pp, pf, pc, dif, pts, empate, porSorteo, anulado, inasistencias }
//  - empate: la fase terminó y el empate sigue sin resolverse -> requiere sorteo (comparten posición)
//  - porSorteo: el empate se resolvió con el sorteo guardado en torneo.sorteo
//  - anulado: 2 inasistencias, sus partidos no cuentan y queda al final de la tabla
export function construirTabla({ nombres, partidos, anulados, inasistencias, sorteo, marcarEmpates, retirados = new Set() }) {
  const todos = estadisticas(partidos, new Set(nombres))
  const activos = nombres.filter((n) => !anulados.has(n))
  const bloques = agruparDesc(activos, (n) => todos.get(n).pts).flatMap((g) => desempatar(g, { vigentes: partidos, todos }))

  const filas = aplanarBloques(bloques, sorteo, marcarEmpates).map((f) => ({ ...f, anulado: false, retirado: false }))
  let usados = filas.length
  for (const n of nombres.filter((x) => anulados.has(x)).sort(alfa)) {
    filas.push({ equipo: n, pos: ++usados, empate: false, porSorteo: false, anulado: true, retirado: retirados.has(n) })
  }

  return filas.map((f) => {
    const s = todos.get(f.equipo)
    return { ...f, pj: s.pj, pg: s.pg, pp: s.pp, pf: s.pf, pc: s.pc, dif: s.pf - s.pc, pts: s.pts, inasistencias: inasistencias.get(f.equipo) ?? 0 }
  })
}

// Tabla del leaderboard (grupo único)
export function calcularTabla(torneo) {
  const { vigentes, anulados, inasistencias, retirados } = partidosVigentes(torneo)
  return construirTabla({
    nombres: torneo.equipos.map((e) => e.nombreequipo),
    partidos: vigentes,
    anulados,
    retirados,
    inasistencias,
    sorteo: torneo.sorteo,
    marcarEmpates: torneoTerminado(torneo),
  })
}

/* ───────────── D.6: serie de 2 partidos (ida y vuelta) por puntos acumulados ─────────────
   Se usa en la eliminatoria del formato Standard cuando se elige «Ida y vuelta».
   p1 y p2: { equipoA, equipoB, puntosA, puntosB, ganador? } (cada partido con sus propios locales; p2 = resultado
   final, ya con los tiempos extra del segundo partido si hicieron falta). */
export function ganadorSerieIdaVuelta(p1, p2) {
  const [x, y] = [p1.equipoA, p1.equipoB]
  const total = { [x]: 0, [y]: 0 }
  const victorias = { [x]: 0, [y]: 0 }
  for (const p of [p1, p2]) {
    total[p.equipoA] += p.puntosA
    total[p.equipoB] += p.puntosB
    // `ganador` (opcional) manda sobre el marcador: p. ej. inasistencias
    const g = "ganador" in p ? p.ganador : p.puntosA > p.puntosB ? p.equipoA : p.puntosB > p.puntosA ? p.equipoB : null
    if (g) victorias[g]++
  }
  if (victorias[x] === 2) return { ganador: x, motivo: "ganó los dos partidos", total }
  if (victorias[y] === 2) return { ganador: y, motivo: "ganó los dos partidos", total }
  if (total[x] > total[y]) return { ganador: x, motivo: "mayor puntaje acumulado", total }
  if (total[y] > total[x]) return { ganador: y, motivo: "mayor puntaje acumulado", total }
  return { ganador: null, motivo: "acumulado empatado: el segundo partido sigue con tiempos extra de 5 min hasta desempatar", total }
}