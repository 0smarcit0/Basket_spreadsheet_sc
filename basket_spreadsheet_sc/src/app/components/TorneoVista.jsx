"use client"
import { useState } from "react"
import Modal from "./Modal"
import {
  TIPO_STANDARD,
  TIPO_LEADERBOARD,
  TIPOS,
  FORMATOS_PARTIDOS,
  etiquetaTipo,
  etiquetaFormato,
  validarConfig,
  jornadaActiva,
  maxPartidosPorJornada,
  torneoTerminado,
  calcularTabla,
} from "../utils/torneoLogic"

const inputCls =
  "w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
const btnPrimario =
  "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
const btnSecundario =
  "rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"

function Campo({ label, children }) {
  return (
    <label className="mt-3 block text-sm font-medium text-gray-700 first:mt-0 dark:text-gray-200">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  )
}

/* ───────────── Torneo sin iniciar: configuración ───────────── */
function ConfigurarTorneo({ torneo, onIniciar }) {
  const [tipo, setTipo] = useState("")
  const [partidos, setPartidos] = useState("")
  const [porGrupo, setPorGrupo] = useState("")
  const [clasificados, setClasificados] = useState("")
  const [error, setError] = useState("")
  const [confirmando, setConfirmando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const standard = tipo === TIPO_STANDARD
  const total = torneo.equipos.length
  const config = {
    tipo,
    partidosEntreEquipos: partidos,
    equiposPorGrupo: standard ? Number(porGrupo) : null,
    clasificadosPorGrupo: standard ? Number(clasificados) : null,
  }

  const pedirConfirmacion = () => {
    if (total < 2) return setError("Se necesitan al menos 2 equipos para comenzar el torneo.")
    const err = validarConfig(config, total)
    if (err) return setError(err)
    setError("")
    setConfirmando(true)
  }

  const comenzar = async () => {
    setGuardando(true)
    const res = await onIniciar(torneo.nombretorneo, config)
    setGuardando(false)
    setConfirmando(false)
    if (!res.ok) setError(res.error)
  }

  return (
    <div className="max-w-md">
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        El torneo aún no ha iniciado. Configura el formato y pulsa «Comenzar torneo».
      </p>

      <Campo label="Tipo de torneo">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputCls}>
          <option value="" disabled>Seleccione…</option>
          {TIPOS.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </Campo>

      <Campo label="Cantidad de partidos entre equipos">
        <select value={partidos} onChange={(e) => setPartidos(e.target.value)} className={inputCls}>
          <option value="" disabled>Seleccione…</option>
          {FORMATOS_PARTIDOS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </Campo>

      {standard && (
        <>
          <Campo label="Equipos por grupo">
            <input type="number" min={2} max={total} value={porGrupo} onChange={(e) => setPorGrupo(e.target.value)} className={inputCls} />
          </Campo>
          <Campo label="Equipos clasificados por grupo">
            <input type="number" min={1} value={clasificados} onChange={(e) => setClasificados(e.target.value)} className={inputCls} />
          </Campo>
          <p className="mt-3 text-xs text-amber-600">
            El manejo del formato Standard aún no está disponible: podrás iniciarlo, pero por ahora solo se verá su configuración.
          </p>
        </>
      )}

      {total < 2 && <p className="mt-3 text-sm text-red-600">Se necesitan al menos 2 equipos para comenzar el torneo.</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button type="button" onClick={pedirConfirmacion} disabled={!tipo || !partidos || total < 2} className={`${btnPrimario} mt-5`}>
        Comenzar torneo
      </button>

      <Modal
        open={confirmando}
        title="Comenzar torneo"
        size="sm"
        onClose={() => !guardando && setConfirmando(false)}
        footer={
          <>
            <button type="button" disabled={guardando} onClick={() => setConfirmando(false)} className={btnSecundario}>Cancelar</button>
            <button type="button" disabled={guardando} onClick={comenzar} className={btnPrimario}>
              {guardando ? "Creando…" : "Confirmar"}
            </button>
          </>
        }
      >
        <p className="text-sm">
          Si comienzas el torneo <b>no podrás agregar más equipos</b>. ¿Deseas continuar?
        </p>
      </Modal>
    </div>
  )
}

/* ───────────── Piezas del torneo iniciado ───────────── */
const etiquetaInasistencia = (p) => {
  const f = p.resultado?.forfeit
  if (f === "A") return `Inasistencia: ${p.equipoA}`
  if (f === "B") return `Inasistencia: ${p.equipoB}`
  if (f === "both") return "Inasistencia de ambos equipos"
  return null
}

function FilaPartido({ p }) {
  const inasistencia = etiquetaInasistencia(p)
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
      <span>
        {p.equipoA} <span className="text-gray-400">vs</span> {p.equipoB}
      </span>
      {p.estado === "jugado" ? (
        <span className="text-right">
          <span className="font-semibold">{p.resultado.puntosA} - {p.resultado.puntosB}</span>
          {inasistencia && <span className="ml-2 text-xs text-amber-600">{inasistencia}</span>}
        </span>
      ) : (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
          Programado
        </span>
      )}
    </li>
  )
}

const listaCls = "divide-y divide-gray-200 rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-800"

function TablaPosiciones({ filas }) {
  const cols = ["Pos", "Equipo", "PJ", "PG", "PP", "PF", "PC", "Dif", "Pts"]
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            {cols.map((c, i) => (
              <th key={c} className={`px-2 py-1.5 font-medium ${i === 1 ? "text-left" : "text-center"}`}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.equipo} className={`border-b border-gray-100 last:border-0 dark:border-gray-800 ${f.anulado ? "opacity-60" : ""}`}>
              <td className="px-2 py-1.5 text-center font-medium">{f.pos}{f.empate ? "=" : ""}</td>
              <td className="px-2 py-1.5">
                {f.equipo}
                {f.anulado && <span className="ml-2 text-xs text-red-600">Resultados anulados (2 inasistencias)</span>}
                {!f.anulado && f.inasistencias > 0 && (
                  <span className="ml-2 text-xs text-amber-600">{f.inasistencias} inasistencia</span>
                )}
                {f.porSorteo && <span className="ml-2 text-xs text-gray-500">(sorteo)</span>}
              </td>
              <td className="px-2 py-1.5 text-center">{f.pj}</td>
              <td className="px-2 py-1.5 text-center">{f.pg}</td>
              <td className="px-2 py-1.5 text-center">{f.pp}</td>
              <td className="px-2 py-1.5 text-center">{f.pf}</td>
              <td className="px-2 py-1.5 text-center">{f.pc}</td>
              <td className="px-2 py-1.5 text-center">{f.dif > 0 ? `+${f.dif}` : f.dif}</td>
              <td className="px-2 py-1.5 text-center font-bold">{f.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Victoria = 2 pts, derrota = 1 pt, derrota por inasistencia = 0 pts. Empates según el Apéndice D de las Reglas
        Oficiales FIBA: partidos entre los empatados (récord, diferencia y puntos anotados) y luego todos los partidos
        del grupo (diferencia y puntos anotados). Dos inasistencias anulan los partidos del equipo.
      </p>
    </div>
  )
}

/* ───────────── Torneo iniciado ───────────── */
function TorneoIniciado({ torneo, onGenerarJornada, onFinalizarJornada, onRealizarSorteo }) {
  const { config } = torneo
  const leaderboard = config.tipo === TIPO_LEADERBOARD
  const activa = jornadaActiva(torneo)
  const terminado = torneoTerminado(torneo)
  const max = maxPartidosPorJornada(torneo)
  const pendientes = activa ? activa.partidos.filter((p) => p.estado !== "jugado").length : 0
  const finalizadas = torneo.jornadas.filter((j) => j.estado === "finalizada").reverse()
  const tabla = leaderboard ? calcularTabla(torneo) : []
  const requiereSorteo = tabla.some((f) => f.empate)

  const [cantidad, setCantidad] = useState("")
  const [error, setError] = useState("")
  const [procesando, setProcesando] = useState(false)

  const ejecutar = async (accion) => {
    setProcesando(true)
    const res = await accion()
    setProcesando(false)
    if (!res.ok) return setError(res.error)
    setError("")
    setCantidad("")
  }

  const fecha = config.iniciadoEn ? new Date(config.iniciadoEn) : null
  const resumen = [
    ["Tipo", etiquetaTipo(config.tipo)],
    ["Partidos entre equipos", etiquetaFormato(config.partidosEntreEquipos)],
    ...(config.tipo === TIPO_STANDARD
      ? [["Equipos por grupo", config.equiposPorGrupo], ["Clasificados por grupo", config.clasificadosPorGrupo]]
      : []),
    ...(fecha && !Number.isNaN(fecha.getTime()) ? [["Inicio", fecha.toLocaleDateString("es")]] : []),
  ]

  return (
    <div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        {resumen.map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <dt className="text-gray-500 dark:text-gray-400">{k}:</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-5">
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Jornadas</h3>

        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Partidos de la jornada
            <input
              type="number"
              min={1}
              max={max}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder={`Máx. ${max}`}
              disabled={!leaderboard || !!activa || terminado || procesando}
              className={`${inputCls} mt-1 w-40`}
            />
          </label>
          <button
            type="button"
            onClick={() => ejecutar(() => onGenerarJornada(torneo.nombretorneo, cantidad))}
            disabled={!leaderboard || !!activa || terminado || procesando || !cantidad}
            className={btnPrimario}
          >
            Generar jornada
          </button>
          <button
            type="button"
            onClick={() => ejecutar(() => onFinalizarJornada(torneo.nombretorneo, activa.id))}
            disabled={!leaderboard || !activa || pendientes > 0 || procesando}
            className={btnSecundario + " border border-gray-300 dark:border-gray-700"}
          >
            Finalizar jornada
          </button>
        </div>

        {!leaderboard && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Disponible próximamente para el formato Standard.
          </p>
        )}
        {leaderboard && activa && pendientes > 0 && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Para finalizar la jornada faltan {pendientes} {pendientes === 1 ? "partido" : "partidos"} por completar.
          </p>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      {leaderboard && terminado && (
        <div className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Torneo finalizado: todos los equipos ya jugaron entre sí. Esta es la tabla de posiciones final.
        </div>
      )}

      {leaderboard && requiereSorteo && (
        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <p>
            Hay equipos empatados (marcados con «=») que ningún criterio del reglamento logra desempatar. Se definen por
            sorteo.
          </p>
          <button
            type="button"
            disabled={procesando}
            onClick={() => ejecutar(() => onRealizarSorteo(torneo.nombretorneo))}
            className={`${btnPrimario} mt-2`}
          >
            Realizar sorteo de desempate
          </button>
        </div>
      )}

      {leaderboard && activa && (
        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            Jornada {activa.numero} (activa)
          </h3>
          <ul className={listaCls}>
            {activa.partidos.map((p) => (
              <FilaPartido key={p.id} p={p} />
            ))}
          </ul>
        </section>
      )}

      {leaderboard && (
        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Tabla de posiciones</h3>
          <TablaPosiciones filas={tabla} />
        </section>
      )}

      {leaderboard && finalizadas.length > 0 && (
        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Jornadas finalizadas</h3>
          <div className="space-y-2">
            {finalizadas.map((j) => (
              <details key={j.id} className="rounded-md border border-gray-200 dark:border-gray-800">
                <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                  Jornada {j.numero} ({j.partidos.length} {j.partidos.length === 1 ? "partido" : "partidos"})
                </summary>
                <ul className="divide-y divide-gray-200 border-t border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                  {j.partidos.map((p) => (
                    <FilaPartido key={p.id} p={p} />
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/* ───────────── Vista del torneo (según haya iniciado o no) ───────────── */
export default function VistaTorneo({ torneo, onIniciar, onGenerarJornada, onFinalizarJornada, onRealizarSorteo }) {
  return torneo.config ? (
    <TorneoIniciado
      torneo={torneo}
      onGenerarJornada={onGenerarJornada}
      onFinalizarJornada={onFinalizarJornada}
      onRealizarSorteo={onRealizarSorteo}
    />
  ) : (
    <ConfigurarTorneo torneo={torneo} onIniciar={onIniciar} />
  )
}