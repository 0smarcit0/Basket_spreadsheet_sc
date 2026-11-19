"use client"
import Modal from "./Modal"
import {
  TIPO_STANDARD,
  TIPOS,
  FORMATOS_PARTIDOS,
  FORMATOS_ELIMINATORIA,
  etiquetaTipo,
  etiquetaFormato,
  etiquetaFormatoEliminatoria,
  validarConfig,
  jornadaActiva,
  maxPartidosPorJornada,
  calcularTabla,
  potenciaDe2,
  tamanosGrupos,
  METODOS_JORNADAS, etiquetaMetodoJornadas, numeroJornadasCalendario
} from "../utils/torneoLogic"
import {
  etiquetaFase,
  etiquetaPartido,
  tablasGrupos,
  faseGruposTerminada,
  llavePrevista,
  partidosDeFase,
  llavesDeFase,
  etiquetaSiguientePaso,
  equiposRetirables,
  torneoFinalizado,
  campeon,
  clasificacionFinal,
  hayEmpatesSinResolver,
  paresPorJugar,
} from "../utils/torneoEstandar"
import { useState, useEffect } from "react"
import { sharePlanillaFile, downloadFile } from "../utils/print_planilla"
import { generateTablaPosicionesFile } from "../utils/pdfTablaPosiciones"
const inputCls =
  "w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
const btnPrimario =
  "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
const btnSecundario =
  "rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
const listaCls = "divide-y divide-gray-200 rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-800"
const tituloSeccion = "mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200"

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
  const [tercer, setTercer] = useState("si") // juego por el tercer lugar: habilitado por defecto
  const [eliminatoria, setEliminatoria] = useState("1") // partidos por llave en la eliminatoria
  const [error, setError] = useState("")
  const [confirmando, setConfirmando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [metodo, setMetodo] = useState("manual") // método de generación de jornadas
  const standard = tipo === TIPO_STANDARD
  const total = torneo.equipos.length
  const config = {
    tipo,
    partidosEntreEquipos: partidos,
    equiposPorGrupo: standard ? Number(porGrupo) : null,
    clasificadosPorGrupo: standard ? Number(clasificados) : null,
    juegoTercerPuesto: standard && tercer === "si",
    partidosEliminatoria: standard ? eliminatoria : null,
    generacionJornadas: metodo,
  }

  // Vista previa de la configuración Standard
  const p = Number(porGrupo)
  const q = Number(clasificados)
  const tamanos = standard && Number.isInteger(p) && p >= 2 && p <= total ? tamanosGrupos(total, p) : null

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
        El torneo aún no ha iniciado. Configura el formato y pulsa «Comenzar
        torneo».
      </p>

      <Campo label="Tipo de torneo">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className={inputCls}
        >
          <option value="" disabled>
            Seleccione…
          </option>
          {TIPOS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </Campo>

      <Campo label="Cantidad de partidos entre equipos">
        <select
          value={partidos}
          onChange={(e) => setPartidos(e.target.value)}
          className={inputCls}
        >
          <option value="" disabled>
            Seleccione…
          </option>
          {FORMATOS_PARTIDOS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Método de generación de jornadas">
        <select
          value={metodo}
          onChange={(e) => setMetodo(e.target.value)}
          className={inputCls}
        >
          {METODOS_JORNADAS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </Campo>

      {standard && (
        <>
          <Campo label="Equipos por grupo">
            <input
              type="number"
              min={2}
              max={total}
              value={porGrupo}
              onChange={(e) => setPorGrupo(e.target.value)}
              className={inputCls}
            />
          </Campo>
          <Campo label="Equipos clasificados por grupo">
            <input
              type="number"
              min={1}
              max={Number.isInteger(p) && p >= 2 ? p : undefined}
              value={clasificados}
              onChange={(e) => setClasificados(e.target.value)}
              className={inputCls}
            />
          </Campo>
          <Campo label="Partidos por llave en la eliminatoria">
            <select
              value={eliminatoria}
              onChange={(e) => setEliminatoria(e.target.value)}
              className={inputCls}
            >
              {FORMATOS_ELIMINATORIA.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Juego por el tercer lugar">
            <select
              value={tercer}
              onChange={(e) => setTercer(e.target.value)}
              className={inputCls}
            >
              <option value="si">
                Sí (entre los perdedores de las semifinales)
              </option>
              <option value="no">No</option>
            </select>
          </Campo>

          {tamanos && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Se formarán {tamanos.length}{" "}
              {tamanos.length === 1 ? "grupo" : "grupos"} al azar (
              {tamanos.join(", ")} equipos); los equipos que sobran se reparten
              de a uno por grupo.
              {Number.isInteger(q) && q >= 1 && q <= p && (
                <>
                  {" "}
                  Clasificarán {tamanos.length * q} equipos a una llave de{" "}
                  {potenciaDe2(tamanos.length * q)}.
                </>
              )}
            </p>
          )}
        </>
      )}

      {total < 2 && (
        <p className="mt-3 text-sm text-red-600">
          Se necesitan al menos 2 equipos para comenzar el torneo.
        </p>
      )}
      {(() => {
        const tamanosCal = standard ? tamanos : [total];
        if (metodo !== "automatico" || !partidos || !tamanosCal) return null;
        const n = numeroJornadasCalendario(tamanosCal, partidos);
        return (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Se generarán {n} {n === 1 ? "jornada" : "jornadas"} con todos los cruces de la fase de grupos, todas disponibles al mismo tiempo
      
            {partidos === "mejor3" &&
              " (en mejor de 3, el tercer juego se genera solo si la serie queda 1-1)"}
            .
            {standard &&
              " La fase eliminatoria siempre se genera de forma manual."}
          </p>
        );
      })()}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={pedirConfirmacion}
        disabled={!tipo || !partidos || total < 2}
        className={`${btnPrimario} mt-5`}
      >
        Comenzar torneo
      </button>

      <Modal
        open={confirmando}
        title="Comenzar torneo"
        size="sm"
        onClose={() => !guardando && setConfirmando(false)}
        footer={
          <>
            <button
              type="button"
              disabled={guardando}
              onClick={() => setConfirmando(false)}
              className={btnSecundario}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={guardando}
              onClick={comenzar}
              className={btnPrimario}
            >
              {guardando ? "Creando…" : "Confirmar"}
            </button>
          </>
        }
      >
        <p className="text-sm">
          Si comienzas el torneo <b>no podrás agregar más equipos</b>
          {standard && " y los grupos se sortearán en ese momento"}
          {metodo === "automatico" && " y se generará todo el calendario de la fase de grupos"}. ¿Deseas
          continuar?
        </p>
      </Modal>
    </div>
  );
}

/* ───────────── Piezas del torneo iniciado ───────────── */
const etiquetaInasistencia = (p) => {
  const f = p.resultado?.forfeit
  if (f === "A") return `Inasistencia: ${p.equipoA}`
  if (f === "B") return `Inasistencia: ${p.equipoB}`
  if (f === "both") return "Inasistencia de ambos equipos"
  return null
}

function FilaPartido({ p, etiqueta, semillaA, semillaB }) {
  const inasistencia = etiquetaInasistencia(p)
  const semilla = (n) => (n ? <span className="text-xs text-gray-400">({n}) </span> : null)
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
      <span>
        {etiqueta && (
          <span className="mr-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {etiqueta}
          </span>
        )}
        {semilla(semillaA)}{p.equipoA} <span className="text-gray-400">vs</span> {semilla(semillaB)}{p.equipoB}
      </span>
      {p.estado === "anulado" ? (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          Anulado (retiro)
        </span>
      ) : p.estado === "jugado" ? (
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

const NOTA_TABLA =
  "Victoria = 2 pts, derrota = 1 pt, derrota por inasistencia = 0 pts. Empates según el Apéndice D de las Reglas Oficiales FIBA: partidos entre los empatados (récord, diferencia y puntos anotados) y luego todos los partidos del grupo (diferencia y puntos anotados). Dos inasistencias, o el retiro del torneo, anulan los partidos del equipo."

function TablaPosiciones({ filas, nota = true }) {
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
                {f.retirado && <span className="ml-2 text-xs text-red-600">Retirado (resultados anulados)</span>}
                {f.anulado && !f.retirado && <span className="ml-2 text-xs text-red-600">Resultados anulados (2 inasistencias)</span>}
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
      {nota && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{NOTA_TABLA}</p>}
    </div>
  )
}

/* ───────────── Standard: grupos (un desplegable por grupo) ───────────── */
function SeccionGrupos({ tablas, acciones }) {
  return (
    <section className="mt-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Fase de grupos</h3>
        {acciones}
      </div>
      <div className="space-y-2">
        {tablas.map((t) => (
          <details key={t.nombre} className="rounded-md border border-gray-200 dark:border-gray-800">
            <summary className="cursor-pointer px-3 py-2 text-sm font-semibold uppercase">
              Grupo {t.nombre}
              <span className="ml-2 text-xs font-normal normal-case text-gray-500 dark:text-gray-400">
                {t.equipos.length} equipos{t.terminado ? " · finalizado" : ""}
              </span>
            </summary>
            <div className="border-t border-gray-200 p-3 dark:border-gray-800">
              <TablaPosiciones filas={t.filas} nota={false} />
            </div>
          </details>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{NOTA_TABLA}</p>
    </section>
  )
}

/* ───────────── Calendario automático: todas las jornadas de la fase de grupos ───────────── */
const ESTADO_JORNADA = {
  activa: ["Activa", "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"],
  pendiente: ["Pendiente", "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"],
  finalizada: ["Finalizada", "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"],
}

function CalendarioJornadas({ jornadas, etiqueta, mejor3 }) {
  const primeraAbierta = jornadas.find((j) => j.partidos.some((p) => p.estado === "programado"))?.id

  return (
    <section className="mt-5">
      <h3 className={tituloSeccion}>
        Calendario de la fase de grupos
        <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
          {jornadas.length} {jornadas.length === 1 ? "jornada" : "jornadas"}
        </span>
      </h3>
      <div className="space-y-2">
        {jornadas.map((j) => {
          const [texto, cls] = ESTADO_JORNADA[j.estado] ?? ESTADO_JORNADA.pendiente
          return (
             <details key={j.id} open={j.id === primeraAbierta} className="rounded-md border border-gray-200 dark:border-gray-800">
              <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                Jornada {j.numero}
                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                  {j.partidos.length} {j.partidos.length === 1 ? "partido" : "partidos"}
                </span>
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${cls}`}>{texto}</span>
              </summary>
              <ul className="divide-y divide-gray-200 border-t border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {j.partidos.map((p) => (
                  <FilaPartido key={p.id} p={p} etiqueta={etiqueta(p)} />
                ))}
              </ul>
            </details>
          )
        })}
      </div>
      {mejor3 && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          En mejor de 3, el tercer juego solo se genera si la serie queda 1-1 al terminar el calendario.
        </p>
      )}
    </section>
  )
}

/* ───────────── Standard: llaves de eliminación directa (toggle por fase) ───────────── */
// Una llave con serie (ida y vuelta / mejor de 3): encabezado con el estado y sus partidos
function LlaveSerie({ llave, semillas, modo }) {
  const [A, B] = [llave.equipoA, llave.equipoB]
  const sem = (n) => (semillas.get(n) ? <span className="text-xs text-gray-400">({semillas.get(n)}) </span> : null)
  const maxJuegos = modo === "ida_vuelta" ? 2 : 3
  let estado
  if (llave.retiro) estado = `Avanza ${llave.ganador} por retiro de ${llave.retiro}`
  else if (llave.decidida && llave.ganador) estado = `Avanza ${llave.ganador}`
  else if (llave.problema) estado = llave.problema
  else estado = "En juego"
  const marcador =
    modo === "ida_vuelta"
      ? `Global: ${llave.global[A]} - ${llave.global[B]}`
      : `Serie: ${llave.victorias[A]} - ${llave.victorias[B]}`

  return (
    <li>
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 px-3 py-2 text-sm font-medium dark:bg-gray-900">
        <span>{sem(A)}{A} <span className="font-normal text-gray-400">vs</span> {sem(B)}{B}</span>
        <span className={`text-xs ${llave.problema && !llave.decidida ? "text-red-600" : "text-gray-600 dark:text-gray-300"}`}>
          {llave.jugados?.length ? `${marcador} · ` : ""}{estado}
        </span>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {llave.partidos.map((p) => (
          <FilaPartido key={p.id} p={p} etiqueta={`Juego ${p.juego ?? 1}`} />
        ))}
      </ul>
      {!llave.decidida && !llave.problema && llave.partidos.length < maxJuegos && (
        <p className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400">
          {modo === "mejor3" && llave.partidos.length >= 2
            ? "El juego 3 se genera solo si la serie queda 1-1."
            : `Juego ${llave.partidos.length + 1} pendiente de generar.`}
        </p>
      )}
    </li>
  )
}

function SeccionLlaves({ torneo }) {
  const elim = torneo.eliminatoria
  const { fases } = elim ?? llavePrevista(torneo)
  const modo = torneo.config.partidosEliminatoria ?? "1"
  const [seleccion, setSeleccion] = useState(null)

  // Por defecto, la fase más avanzada que ya tiene partidos (o la primera)
  const inicial = [...fases].reverse().find((f) => partidosDeFase(torneo, f).length > 0) ?? fases[0]
  const fase = seleccion && fases.includes(seleccion) ? seleccion : inicial
  const partidos = partidosDeFase(torneo, fase)
  const llaves = llavesDeFase(torneo, fase)
  const semillas = new Map(fase === fases[0] ? (elim?.clasificados ?? []).map((c) => [c.equipo, c.semilla]) : [])

  return (
    <section className="mt-5">
      <h3 className={tituloSeccion}>
        Llaves · eliminación directa
        <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">{etiquetaFormatoEliminatoria(modo)}</span>
      </h3>

      <div className="inline-flex rounded-lg bg-gray-200 p-1 dark:bg-gray-800 mb-1" role="tablist">
        {fases.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={fase === f}
            onClick={() => setSeleccion(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              fase === f
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white"
                : "text-gray-600 hover:text-gray-800 dark:text-gray-300"
            }`}
          >
            {etiquetaFase(f)}
          </button>
        ))}
      </div>

      {partidos.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {elim
            ? "Esta fase se generará cuando termine la anterior."
            : "La fase eliminatoria se generará cuando termine la fase de grupos."}
        </p>
      ) : modo === "1" ? (
        <ul className={listaCls}>
          {partidos.map((p) => (
            <FilaPartido
              key={p.id}
              p={p}
              semillaA={semillas.get(p.equipoA)}
              semillaB={semillas.get(p.equipoB)}
            />
          ))}
        </ul>
      ) : (
        <ul className={`${listaCls} overflow-hidden`}>
          {llaves.map((l) => (
            <LlaveSerie key={l.llave} llave={l} semillas={semillas} modo={modo} />
          ))}
        </ul>
      )}
    </section>
  )
}

function ClasificacionFinal({ filas }) {
  return (
    <section className="mt-5">
      <h3 className={tituloSeccion}>Clasificación final</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <th className="px-2 py-1.5 text-center font-medium">Pos</th>
              <th className="px-2 py-1.5 text-left font-medium">Equipo</th>
              <th className="px-2 py-1.5 text-left font-medium">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.equipo} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                <td className="px-2 py-1.5 text-center font-medium">{f.pos}{f.empate ? "=" : ""}</td>
                <td className="px-2 py-1.5">
                  {f.equipo}
                  {f.porSorteo && <span className="ml-2 text-xs text-gray-500">(sorteo)</span>}
                </td>
                <td className="px-2 py-1.5 text-gray-600 dark:text-gray-300">{f.etapa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </section>
  )
}

/* ───────────── Retiro voluntario ───────────── */
function RetirarEquipoModal({ torneo, onClose, onRetirar }) {
  const candidatos = equiposRetirables(torneo)
  const [equipo, setEquipo] = useState("")
  const [error, setError] = useState("")
  const [guardando, setGuardando] = useState(false)

  const retirar = async () => {
    setGuardando(true)
    const res = await onRetirar(torneo.nombretorneo, equipo)
    setGuardando(false)
    if (res.ok) return onClose()
    setError(res.error)
  }

  return (
    <Modal
      open
      title="Retirar equipo"
      size="md"
      onClose={() => !guardando && onClose()}
      footer={
        <>
          <button type="button" disabled={guardando} onClick={onClose} className={btnSecundario}>Cancelar</button>
          <button
            type="button"
            disabled={!equipo || guardando}
            onClick={retirar}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {guardando ? "Retirando…" : "Retirar equipo"}
          </button>
        </>
      }
    >
      {candidatos.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No hay equipos que puedan retirarse en este momento.</p>
      ) : (
        <>
          <Campo label="Equipo que se retira">
            <select value={equipo} onChange={(e) => { setEquipo(e.target.value); setError("") }} className={inputCls}>
              <option value="" disabled>Seleccione un equipo</option>
              {candidatos.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </Campo>
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
            Al retirarse, <b>todos los partidos del equipo quedan anulados</b> (también para sus rivales), sus partidos
            pendientes se cancelan y no se le vuelve a programar. En la eliminatoria avanza su rival. Esta acción no se
            puede deshacer.
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </>
      )}
    </Modal>
  )
}

/* ───────────── Torneo iniciado ───────────── */
function TorneoIniciado({ torneo, onGenerarJornada, onGenerarFase, onFinalizarJornada, onRealizarSorteo, onRetirarEquipo }) {
  const { config } = torneo;
  const standard = config.tipo === TIPO_STANDARD;
  const activa = jornadaActiva(torneo);
  const finalizado = torneoFinalizado(torneo);
  const gruposListos = standard && faseGruposTerminada(torneo);
  const max = maxPartidosPorJornada(torneo);
  const pendientes = activa
    ? activa.partidos.filter((p) => p.estado === "programado").length
    : 0;
  const sorteoPendiente = hayEmpatesSinResolver(torneo);

  // Fase de grupos (o leaderboard) todavía puede programar jornadas
  const enGrupos = !standard || (!torneo.eliminatoria && !gruposListos);
  const puedeGenerarFase =
    standard &&
    !activa &&
    !finalizado &&
    (gruposListos || !!torneo.eliminatoria);

  const tabla = !standard ? calcularTabla(torneo) : [];
  const tablas = standard ? tablasGrupos(torneo) : [];
  const finalFilas = standard && finalizado ? clasificacionFinal(torneo) : [];
  const etiqueta = (p) => (standard ? etiquetaPartido(torneo, p) : null);
  const automatico = config.generacionJornadas === "automatico";
  const calendarioActivo = automatico && activa?.fase === "grupos"; // hay jornadas de grupos abiertas

  const puedeGenerarJornada =
    !activa &&
    !finalizado &&
    enGrupos &&
    (!automatico || paresPorJugar(torneo).length > 0); // automático: solo juegos de desempate

  const calendario = automatico
    ? torneo.jornadas.filter((j) => j.fase === "grupos")
    : [];
  const finalizadas = torneo.jornadas
    .filter(
      (j) => j.estado === "finalizada" && !(automatico && j.fase === "grupos"),
    ) // las de grupos ya están en el calendario
    .reverse();
  const [cantidad, setCantidad] = useState("");
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [retirando, setRetirando] = useState(false);
  const hayRetirables = equiposRetirables(torneo).length > 0;
  // Secciones del PDF: leaderboard = una tabla; standard = clasificación final (si ya hay) + una tabla por grupo
  const seccionesPdf = standard
    ? [
        ...(finalFilas.length > 0
          ? [
              {
                tipo: "final",
                titulo: "Clasificación final",
                filas: finalFilas,
              },
            ]
          : []),
        ...tablas.map((t) => ({ titulo: `Grupo ${t.nombre}`, filas: t.filas })),
      ]
    : [{ filas: tabla }];
  const ejecutar = async (accion) => {
    setProcesando(true);
    const res = await accion();
    setProcesando(false);
    if (!res.ok) return setError(res.error);
    setError("");
    setCantidad("");
  };

  const fecha = config.iniciadoEn ? new Date(config.iniciadoEn) : null;
  const resumen = [
    ["Tipo", etiquetaTipo(config.tipo)],
    ["Partidos entre equipos", etiquetaFormato(config.partidosEntreEquipos)],
    [
      "Generación de jornadas",
      etiquetaMetodoJornadas(config.generacionJornadas),
    ],
    ...(standard
      ? [
          ["Equipos por grupo", config.equiposPorGrupo],
          ["Clasificados por grupo", config.clasificadosPorGrupo],
          [
            "Eliminatoria",
            etiquetaFormatoEliminatoria(config.partidosEliminatoria ?? "1"),
          ],
          ["Tercer puesto", config.juegoTercerPuesto ? "Sí" : "No"],
        ]
      : []),
    ...((torneo.retirados ?? []).length > 0
      ? [
          [
            "Retirados",
            torneo.retirados
              .map((r) => `${r.equipo} (${etiquetaFase(r.fase)})`)
              .join(", "),
          ],
        ]
      : []),
    ...(fecha && !Number.isNaN(fecha.getTime())
      ? [["Inicio", fecha.toLocaleDateString("es")]]
      : []),
  ];

  return (
    <div>
      <details className="rounded-md border border-gray-200 dark:border-gray-800">
        <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
          Información general del torneo
        </summary>
        <div className="border-t border-gray-200 p-3 dark:border-gray-800">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {resumen.map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-gray-500 dark:text-gray-400">{k}:</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </details>

      <section className="mt-5">
        <h3 className={tituloSeccion}>Gestion de Jornadas</h3>

        <div className="flex flex-wrap items-end gap-3">
          {!automatico && (
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Partidos de la jornada
              <input
                type="number"
                min={1}
                max={max}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder={`Máx. ${max} ${max === 1 ? "partido" : "partidos"}`}
                disabled={!puedeGenerarJornada || procesando}
                className={`${inputCls} mt-1 w-40`}
              />
            </label>
          )}
          {(!automatico || config.partidosEntreEquipos === "mejor3") && (
            <button
              type="button"
              onClick={() =>
                ejecutar(() => onGenerarJornada(torneo.nombretorneo, cantidad))
              }
              disabled={
                !puedeGenerarJornada || procesando || (!automatico && !cantidad)
              }
              className={btnPrimario}
            >
              {automatico ? "Generar juegos de desempate" : "Generar jornada"}
            </button>
          )}
          {standard && (
            <button
              type="button"
              onClick={() => ejecutar(() => onGenerarFase(torneo.nombretorneo))}
              disabled={!puedeGenerarFase || procesando}
              className={btnPrimario}
            >
              {etiquetaSiguientePaso(torneo)}
            </button>
          )}
          {!calendarioActivo && (
            <button
              type="button"
              onClick={() =>
                ejecutar(() =>
                  onFinalizarJornada(torneo.nombretorneo, activa.id),
                )
              }
              disabled={!activa || pendientes > 0 || procesando}
              className={
                btnSecundario + " border border-gray-300 dark:border-gray-700"
              }
            >
              Finalizar jornada
            </button>
          )}
          <button
            type="button"
            onClick={() => setRetirando(true)}
            disabled={!hayRetirables || procesando}
            className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-gray-800"
          >
            Retirar equipo
          </button>
        </div>

        {activa && !calendarioActivo && pendientes > 0 && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Para finalizar la jornada faltan {pendientes}{" "}
            {pendientes === 1 ? "partido" : "partidos"} por completar.
          </p>
        )}
        {standard &&
          gruposListos &&
          !torneo.eliminatoria &&
          !activa &&
          !finalizado && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              La fase de grupos terminó. Genera la fase eliminatoria.
            </p>
          )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      {retirando && (
        <RetirarEquipoModal
          torneo={torneo}
          onClose={() => setRetirando(false)}
          onRetirar={onRetirarEquipo}
        />
      )}

      {finalizado && (
        <div className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
          {standard ? (
            <>
              Torneo finalizado. Campeón: <b>{campeon(torneo)}</b>.
            </>
          ) : (
            "Torneo finalizado: todos los equipos ya jugaron entre sí. Esta es la tabla de posiciones final."
          )}
        </div>
      )}

      {sorteoPendiente && (
        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <p>
            Hay equipos empatados que ningún criterio del reglamento logra
            desempatar
            {standard ? "" : " (marcados con «=»)"}. Se definen por sorteo.
          </p>
          <button
            type="button"
            disabled={procesando}
            onClick={() =>
              ejecutar(() => onRealizarSorteo(torneo.nombretorneo))
            }
            className={`${btnPrimario} mt-2`}
          >
            Realizar sorteo de desempate
          </button>
        </div>
      )}

      {activa && !calendarioActivo && (
        <section className="mt-5">
          <h3 className={tituloSeccion}>
            Jornada {activa.numero} (activa)
            {standard ? ` · ${etiquetaFase(activa.fase)}` : ""}
          </h3>
          <ul className={listaCls}>
            {activa.partidos.map((p) => (
              <FilaPartido key={p.id} p={p} etiqueta={etiqueta(p)} />
            ))}
          </ul>
        </section>
      )}
      {calendario.length > 0 && (
        <CalendarioJornadas
          jornadas={calendario}
          etiqueta={etiqueta}
          mejor3={config.partidosEntreEquipos === "mejor3"}
        />
      )}

      {standard && finalFilas.length > 0 && (
        <ClasificacionFinal filas={finalFilas} />
      )}

      {standard ? (
        <>
          <SeccionGrupos
            tablas={tablas}
            acciones={
              <BotonCompartirTabla torneo={torneo} secciones={seccionesPdf} />
            }
          />
          <SeccionLlaves torneo={torneo} />
        </>
      ) : (
        <section className="mt-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Tabla de posiciones
            </h3>
            <BotonCompartirTabla torneo={torneo} secciones={seccionesPdf} />
          </div>
          <TablaPosiciones filas={tabla} />
        </section>
      )}

      {finalizadas.length > 0 && (
        <section className="mt-5">
          <h3 className={tituloSeccion}>Historial de partidos</h3>
          <div className="space-y-2">
            {finalizadas.map((j) => (
              <details
                key={j.id}
                className="rounded-md border border-gray-200 dark:border-gray-800"
              >
                <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                  Jornada {j.numero}
                  {standard ? ` · ${etiquetaFase(j.fase)}` : ""} (
                  {j.partidos.length}{" "}
                  {j.partidos.length === 1 ? "partido" : "partidos"})
                </summary>
                <ul className="divide-y divide-gray-200 border-t border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                  {j.partidos.map((p) => (
                    <FilaPartido key={p.id} p={p} etiqueta={etiqueta(p)} />
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ───────────── Vista del torneo (según haya iniciado o no) ───────────── */
export default function VistaTorneo({ torneo, onIniciar, onGenerarJornada, onGenerarFase, onFinalizarJornada, onRealizarSorteo, onRetirarEquipo }) {
  return torneo.config ? (
    <TorneoIniciado
      torneo={torneo}
      onGenerarJornada={onGenerarJornada}
      onGenerarFase={onGenerarFase}
      onFinalizarJornada={onFinalizarJornada}
      onRealizarSorteo={onRealizarSorteo}
      onRetirarEquipo={onRetirarEquipo}
    />
  ) : (
    <ConfigurarTorneo torneo={torneo} onIniciar={onIniciar} />
  )
}

function BotonCompartirTabla({ torneo, secciones }) {
  const [archivo, setArchivo] = useState(null)
  const [error, setError] = useState("")

  // El PDF se regenera solo cuando cambian los datos reales
  const firma = JSON.stringify(secciones)

  useEffect(() => {
    let cancelado = false
    setArchivo(null)
    setError("")
    generateTablaPosicionesFile(torneo, secciones, NOTA_TABLA)
      .then((file) => { if (!cancelado) setArchivo(file) })
      .catch(() => { if (!cancelado) setError("No se pudo generar el PDF.") })
    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firma, torneo.nombretorneo])

  const compartir = () => sharePlanillaFile(archivo, `Tabla de posiciones · ${torneo.nombretorneo}`)

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button type="button" onClick={compartir} disabled={!archivo} className={btnPrimario}>
        {archivo || error ? "Compartir tabla" : "Preparando PDF…"}
      </button>
    </div>
  )
}