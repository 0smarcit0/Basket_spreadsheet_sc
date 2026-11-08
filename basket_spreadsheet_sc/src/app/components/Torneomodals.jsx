"use client"
import { useState } from "react"
import { ChevronRight, Plus, Trash2, X } from "lucide-react"
import Modal from "./Modal"
import VistaTorneo from "./TorneoVista"
import { jornadaActiva } from "../utils/torneoLogic"
import {
  equipoVacio,
  equipoTieneDatos,
  limpiarEquipo,
  validarEquipo,
  MAX_JUGADORES,
  MAX_CUERPO_TECNICO,
  CARGOS,
  CARGO_COACH,
  CARGO_ASISTENTE,
} from "../utils/hooks/useTorneos"

// 80vw x 70vh. El "!" hace que gane sobre el max-w-* que Modal aplica por `size`.
const MODAL_GRANDE = "!max-w-[80vw] h-[70vh]"

const inputCls =
  "w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
const btnPrimario =
  "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
const btnSecundario =
  "rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"

/* ───────────── Formulario de un equipo (compartido por crear y editar) ───────────── */
// campos: [clave, etiqueta, opciones?]  -> con `opciones` se dibuja un select
const SECCIONES = [
  {
    lista: "roster",
    titulo: "Roster",
    agregar: "Agregar jugador",
    max: MAX_JUGADORES,
    grid: "5rem 1fr 1fr 2rem",
    campos: [["dorsal", "Dorsal"], ["nombre", "Nombre"], ["cedula", "Cédula"]],
  },
  {
    lista: "cuerpotecnico",
    titulo: "Cuerpo técnico (opcional)",
    agregar: "Agregar integrante",
    max: MAX_CUERPO_TECNICO,
    grid: "1fr 1fr 1fr 2rem",
    campos: [["nombre", "Nombre"], ["cedula", "Cédula"], ["cargo", "Cargo", CARGOS]],
  },
]

function FormEquipo({ value, onChange }) {
  const setFila = (lista, i, campo, v) =>
    onChange({ ...value, [lista]: value[lista].map((f, idx) => (idx === i ? { ...f, [campo]: v } : f)) })
  const addFila = (s) => {
    if (value[s.lista].length >= s.max) return
    onChange({ ...value, [s.lista]: [...value[s.lista], Object.fromEntries(s.campos.map(([k]) => [k, ""]))] })
  }
  const delFila = (lista, i) => onChange({ ...value, [lista]: value[lista].filter((_, idx) => idx !== i) })

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Nombre del equipo
        <input
          type="text"
          value={value.nombreequipo}
          onChange={(e) => onChange({ ...value, nombreequipo: e.target.value })}
          className={`${inputCls} mt-1 py-2`}
        />
      </label>

      {SECCIONES.map((s) => (
        <section key={s.lista} className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            {s.titulo}{" "}
            <span className="font-normal text-gray-500 dark:text-gray-400">
              ({value[s.lista].length}/{s.max})
            </span>
          </h3>

          {value[s.lista].length > 0 && (
            <div className="space-y-2">
              <div className="grid gap-2 text-xs text-gray-500 dark:text-gray-400" style={{ gridTemplateColumns: s.grid }}>
                {s.campos.map(([k, label]) => (
                  <span key={k}>{label}</span>
                ))}
                <span />
              </div>

              {value[s.lista].map((fila, i) => (
                <div key={i} className="grid gap-2" style={{ gridTemplateColumns: s.grid }}>
                  {s.campos.map(([k, label, opciones]) =>
                    opciones ? (
                      <select
                        key={k}
                        value={fila[k]}
                        onChange={(e) => setFila(s.lista, i, k, e.target.value)}
                        aria-label={`${label} ${i + 1}`}
                        className={inputCls}
                      >
                        <option value="">Seleccione…</option>
                        {opciones.map((o) => (
                          // un cargo ya usado en otra fila no se puede repetir
                          <option key={o} value={o} disabled={value[s.lista].some((f, idx) => idx !== i && f[k] === o)}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        key={k}
                        type="text"
                        value={fila[k]}
                        onChange={(e) => setFila(s.lista, i, k, e.target.value)}
                        aria-label={`${label} ${i + 1}`}
                        className={inputCls}
                      />
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => delFila(s.lista, i)}
                    aria-label={`Quitar fila ${i + 1}`}
                    className="flex items-center justify-center rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-gray-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {value[s.lista].length < s.max ? (
            <button
              type="button"
              onClick={() => addFila(s)}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Plus size={14} /> {s.agregar}
            </button>
          ) : (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Máximo alcanzado ({s.max}).</p>
          )}
        </section>
      ))}
    </div>
  )
}

/* ───────────── Crear torneo ───────────── */
// onCreate({ nombretorneo, equipos }) -> Promise<{ ok, error? }>
export function CrearTorneoModal({ onClose, onCreate }) {
  const [nombre, setNombre] = useState("")
  const [equipos, setEquipos] = useState([]) // JSON del torneo en curso
  const [form, setForm] = useState(equipoVacio)
  const [error, setError] = useState("")
  const [confirmando, setConfirmando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const hayDatos = !!nombre.trim() || equipos.length > 0 || equipoTieneDatos(form)

  const cerrar = () => {
    if (hayDatos && !window.confirm("Hay un registro en curso. ¿Deseas descartarlo?")) return
    onClose()
  }

  const guardarEquipo = () => {
    const equipo = limpiarEquipo(form)
    const err = validarEquipo(equipo, equipos)
    if (err) return setError(err)
    setEquipos((prev) => [...prev, equipo])
    setForm(equipoVacio())
    setError("")
  }

  const pedirConfirmacion = () => {
    if (!nombre.trim()) return setError("Escribe el nombre del torneo.")
    if (equipoTieneDatos(form)) return setError("Tienes un equipo sin guardar. Pulsa «Guardar equipo» o vacía los campos.")
    if (equipos.length === 0) return setError("Registra al menos un equipo.")
    setError("")
    setConfirmando(true)
  }

  const finalizar = async () => {
    setGuardando(true)
    const res = await onCreate({ nombretorneo: nombre.trim(), equipos })
    setGuardando(false)
    if (res.ok) return onClose()
    setConfirmando(false)
    setError(res.error)
  }

  return (
    <>
      <Modal
        open
        title="Nuevo torneo"
        size="xl"
        className={MODAL_GRANDE}
        closeOnOverlay={false}
        onClose={cerrar}
        footer={
          <>
            {error && <p className="mr-auto self-center text-sm text-red-600">{error}</p>}
            <button type="button" onClick={cerrar} className={btnSecundario}>Cancelar</button>
            <button type="button" onClick={pedirConfirmacion} className={btnPrimario}>Finalizar registro</button>
          </>
        }
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Nombre del torneo
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className={`${inputCls} mt-1 py-2`} />
        </label>

        {equipos.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Equipos guardados ({equipos.length})</p>
            <ul className="flex flex-wrap gap-2">
              {equipos.map((e, i) => (
                <li
                  key={e.nombreequipo}
                  className="flex items-center gap-1 rounded-full bg-blue-50 py-1 pl-3 pr-1 text-sm text-blue-800 dark:bg-gray-800 dark:text-blue-300"
                >
                  {e.nombreequipo}
                  <button
                    type="button"
                    onClick={() => setEquipos((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label={`Quitar ${e.nombreequipo}`}
                    className="rounded-full p-1 hover:bg-blue-100 dark:hover:bg-gray-700"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <hr className="my-5 border-gray-200 dark:border-gray-800" />

        <h3 className="mb-3 text-base font-semibold">Nuevo equipo</h3>
        <FormEquipo value={form} onChange={setForm} />

        <button
          type="button"
          onClick={guardarEquipo}
          className="mt-5 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Guardar equipo
        </button>
      </Modal>

      {/* Submodal de confirmación (Modal soporta apilarse) */}
      <Modal
        open={confirmando}
        title="Finalizar registro"
        size="sm"
        onClose={() => !guardando && setConfirmando(false)}
        footer={
          <>
            <button type="button" disabled={guardando} onClick={() => setConfirmando(false)} className={btnSecundario}>Volver</button>
            <button type="button" disabled={guardando} onClick={finalizar} className={btnPrimario}>
              {guardando ? "Guardando…" : "Confirmar"}
            </button>
          </>
        }
      >
        <p className="text-sm">
          Se registrará el torneo «{nombre.trim()}» con {equipos.length} {equipos.length === 1 ? "equipo" : "equipos"}. ¿Deseas continuar?
        </p>
      </Modal>
    </>
  )
}

/* ───────────── Ver torneo → ver/editar equipo, agregar equipo ───────────── */
// Sirve para editar un equipo existente o para crear uno nuevo (según `inicial`).
function EquipoModal({ titulo, inicial, textoGuardar, onClose, onSave }) {
  const [form, setForm] = useState(() => structuredClone(inicial))
  const [error, setError] = useState("")
  const [guardando, setGuardando] = useState(false)

  const guardar = async () => {
    setGuardando(true)
    const res = await onSave(form)
    setGuardando(false)
    if (res.ok) return onClose()
    setError(res.error)
  }

  return (
    <Modal
      open
      title={titulo}
      size="xl"
      className={MODAL_GRANDE}
      closeOnOverlay={false}
      onClose={onClose}
      footer={
        <>
          {error && <p className="mr-auto self-center text-sm text-red-600">{error}</p>}
          <button type="button" onClick={onClose} className={btnSecundario}>Cancelar</button>
          <button type="button" disabled={guardando} onClick={guardar} className={btnPrimario}>
            {guardando ? "Guardando…" : textoGuardar}
          </button>
        </>
      }
    >
      <FormEquipo value={form} onChange={setForm} />
    </Modal>
  )
}

// onUpdateEquipo(nombreTorneo, nombreEquipoViejo, equipoNuevo) y
// onAddEquipo(nombreTorneo, equipoNuevo) -> Promise<{ ok, error? }>
// onIniciarTorneo(nombreTorneo, config), onGenerarJornada(nombreTorneo, cantidad),
// onFinalizarJornada(nombreTorneo, jornadaId), onRealizarSorteo(nombreTorneo) -> Promise<{ ok, error? }>
export function DetalleTorneoModal({
  torneo,
  onClose,
  onUpdateEquipo,
  onAddEquipo,
  onIniciarTorneo,
  onGenerarJornada,
  onFinalizarJornada,
  onRealizarSorteo,
}) {
  const [vista, setVista] = useState("equipos") // "equipos" | "torneo"
  const [equipoSel, setEquipoSel] = useState(null) // nombre del equipo abierto
  const [agregando, setAgregando] = useState(false)
  const equipo = torneo.equipos.find((e) => e.nombreequipo === equipoSel)
  const iniciado = !!torneo.config

  return (
    <>
      <Modal open title={torneo.nombretorneo} size="xl" className={MODAL_GRANDE} onClose={onClose}>
        {/* Toggle superior: Equipos / Torneo */}
        <div className="mb-4 inline-flex rounded-lg bg-gray-200 p-1 dark:bg-gray-800" role="tablist">
          {[["equipos", "Equipos"], ["torneo", "Torneo"]].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={vista === id}
              onClick={() => setVista(id)}
              className={`rounded-md px-5 py-1.5 text-sm font-medium transition-colors ${
                vista === id
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white"
                  : "text-gray-600 hover:text-gray-800 dark:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {vista === "torneo" ? (
          <VistaTorneo
            torneo={torneo}
            onIniciar={onIniciarTorneo}
            onGenerarJornada={onGenerarJornada}
            onFinalizarJornada={onFinalizarJornada}
            onRealizarSorteo={onRealizarSorteo}
          />
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {torneo.equipos.length} {torneo.equipos.length === 1 ? "equipo" : "equipos"}
                {iniciado && " · El torneo ya inició: no se pueden agregar equipos."}
              </p>
              <button
                type="button"
                onClick={() => setAgregando(true)}
                disabled={iniciado}
                className={`${btnPrimario} flex shrink-0 items-center gap-1`}
              >
                <Plus size={14} /> Agregar equipo
              </button>
            </div>

            {torneo.equipos.length === 0 ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">Este torneo no tiene equipos registrados.</p>
            ) : (
              <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {torneo.equipos.map((e) => (
                  <li key={e.nombreequipo}>
                    <button
                      type="button"
                      onClick={() => setEquipoSel(e.nombreequipo)}
                      className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <span className="flex-1">
                        <span className="block text-sm font-medium">{e.nombreequipo}</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {e.roster.length} jugadores, {e.cuerpotecnico.length} en cuerpo técnico
                        </span>
                      </span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Modal>

      {equipo && (
        <EquipoModal
          key={equipo.nombreequipo}
          titulo={`Equipo: ${equipo.nombreequipo}`}
          inicial={equipo}
          textoGuardar="Guardar cambios"
          onClose={() => setEquipoSel(null)}
          onSave={(nuevo) => onUpdateEquipo(torneo.nombretorneo, equipo.nombreequipo, nuevo)}
        />
      )}

      {agregando && (
        <EquipoModal
          key="nuevo-equipo"
          titulo="Nuevo equipo"
          inicial={equipoVacio()}
          textoGuardar="Agregar equipo"
          onClose={() => setAgregando(false)}
          onSave={(nuevo) => onAddEquipo(torneo.nombretorneo, nuevo)}
        />
      )}
    </>
  )
}

/* ───────────── Planilla nueva: elegir torneo y partido/equipos ───────────── */
const SIN_TORNEO = "__sin_torneo__"
export const MAX_JUGADORES_PLANILLA = MAX_JUGADORES // filas de jugadores por equipo en la planilla

// Modal obligatorio: no se puede cerrar, solo continuar.
//  - Torneo sin iniciar: se eligen los equipos A y B a mano.
//  - Torneo iniciado (leaderboard): se elige un partido programado de la jornada activa.
// onConfirm(null)                                        = continuar sin torneo
// onConfirm({ torneo, equipoA, equipoB, partido|null })  = cargar esos datos en la planilla
//   (partido = { id, jornadaId } cuando viene de una jornada)
export function IniciarPlanillaModal({ torneos, loaded, onConfirm }) {
  const [opcion, setOpcion] = useState("") // "" | SIN_TORNEO | nombre de torneo
  const [nombreA, setNombreA] = useState("")
  const [nombreB, setNombreB] = useState("")
  const [partidoId, setPartidoId] = useState("")

  const torneo = torneos.find((t) => t.nombretorneo === opcion)
  const iniciado = !!torneo?.config
  const leaderboard = torneo?.config?.tipo === "leaderboard"
  const jornada = torneo && iniciado ? jornadaActiva(torneo) : null
  const partido = jornada?.partidos.find((p) => p.id === partidoId && p.estado !== "jugado")
  const hayProgramados = !!jornada?.partidos.some((p) => p.estado !== "jugado")

  const nombreEqA = iniciado ? partido?.equipoA : nombreA
  const nombreEqB = iniciado ? partido?.equipoB : nombreB
  const equipoA = torneo?.equipos.find((e) => e.nombreequipo === nombreEqA)
  const equipoB = torneo?.equipos.find((e) => e.nombreequipo === nombreEqB)

  const mismoEquipo = !iniciado && !!nombreA && nombreA === nombreB
  const pocosEquipos = !!torneo && !iniciado && torneo.equipos.length < 2
  const excedidos = [equipoA, equipoB].filter((e) => e && e.roster.length > MAX_JUGADORES_PLANILLA)

  const puedeContinuar = opcion === SIN_TORNEO || (!!equipoA && !!equipoB && !mismoEquipo)

  const elegirOpcion = (v) => {
    setOpcion(v)
    setNombreA("")
    setNombreB("")
    setPartidoId("")
  }

  const continuar = () =>
    onConfirm(
      opcion === SIN_TORNEO
        ? null
        : { torneo, equipoA, equipoB, partido: iniciado ? { id: partido.id, jornadaId: jornada.id } : null }
    )

  const selectEquipo = (label, value, onChange) => (
    <label className="mt-3 block text-sm font-medium text-gray-700 dark:text-gray-200">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} mt-1 py-2`}>
        <option value="" disabled>Seleccione un equipo</option>
        {torneo.equipos.map((e) => (
          <option key={e.nombreequipo} value={e.nombreequipo}>{e.nombreequipo}</option>
        ))}
      </select>
    </label>
  )

  return (
    <Modal
      open
      title="Nueva planilla"
      size="md"
      showCloseButton={false}
      closeOnEsc={false}
      closeOnOverlay={false}
      footer={
        <button type="button" disabled={!puedeContinuar} onClick={continuar} className={btnPrimario}>
          Continuar
        </button>
      }
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Torneo
        <select value={opcion} onChange={(e) => elegirOpcion(e.target.value)} className={`${inputCls} mt-1 py-2`}>
          <option value="" disabled>{loaded ? "Seleccione una opción" : "Cargando torneos…"}</option>
          <option value={SIN_TORNEO}>Continuar sin torneo</option>
          {torneos.length > 0 && (
            <optgroup label="Torneos">
              {torneos.map((t) => (
                <option key={t.nombretorneo} value={t.nombretorneo}>{t.nombretorneo}</option>
              ))}
            </optgroup>
          )}
        </select>
      </label>

      {loaded && torneos.length === 0 && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">No hay torneos registrados todavía.</p>
      )}

      {/* Torneo sin iniciar: equipos a mano */}
      {torneo && !iniciado && !pocosEquipos && (
        <>
          {selectEquipo("Equipo A", nombreA, setNombreA)}
          {selectEquipo("Equipo B", nombreB, setNombreB)}
        </>
      )}

      {/* Torneo iniciado: partidos de la jornada activa */}
      {torneo && iniciado && !leaderboard && (
        <p className="mt-3 text-sm text-amber-600">El formato Standard aún no está disponible para jugar partidos.</p>
      )}
      {torneo && iniciado && leaderboard && !jornada && (
        <p className="mt-3 text-sm text-red-600">
          Este torneo no tiene una jornada activa. Genera una desde la sección Torneos.
        </p>
      )}
      {jornada && (
        <fieldset className="mt-3">
          <legend className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
            Jornada {jornada.numero} (activa): selecciona un partido
          </legend>
          <ul className="space-y-1">
            {jornada.partidos.map((p) => {
              const jugado = p.estado === "jugado"
              return (
                <li key={p.id}>
                  <label
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm ${
                      jugado ? "opacity-50" : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="partido-jornada"
                      disabled={jugado}
                      checked={partidoId === p.id}
                      onChange={() => setPartidoId(p.id)}
                      className="accent-blue-600"
                    />
                    <span className="flex-1">{p.equipoA} vs {p.equipoB}</span>
                    {jugado && (
                      <span className="text-xs">Jugado {p.resultado.puntosA}-{p.resultado.puntosB}</span>
                    )}
                  </label>
                </li>
              )
            })}
          </ul>
          {!hayProgramados && (
            <p className="mt-2 text-sm text-amber-600">
              Todos los partidos de esta jornada ya se jugaron. Finalízala desde la sección Torneos.
            </p>
          )}
        </fieldset>
      )}

      {pocosEquipos && (
        <p className="mt-3 text-sm text-red-600">Este torneo necesita al menos 2 equipos registrados.</p>
      )}
      {mismoEquipo && (
        <p className="mt-3 text-sm text-red-600">No puedes seleccionar el mismo equipo para A y B.</p>
      )}
      {excedidos.map((e) => (
        <p key={e.nombreequipo} className="mt-3 text-sm text-amber-600">
          {e.nombreequipo} tiene {e.roster.length} jugadores y en la planilla caben {MAX_JUGADORES_PLANILLA}: se cargarán los primeros {MAX_JUGADORES_PLANILLA}.
        </p>
      ))}
    </Modal>
  )
}

// Vuelca el torneo y los equipos elegidos en los campos de la planilla.
// `setValue` es el de react-hook-form (methods.setValue).
export function aplicarTorneoAPlanilla(setValue, { torneo, equipoA, equipoB, partido }) {
  const set = (name, value) => setValue(name, value, { shouldDirty: true })

  set("tournament", torneo.nombretorneo) // select del banner
  set("head.competition", torneo.nombretorneo) // "Competition" del encabezado

  // Vínculo con el partido del torneo: se guarda con la planilla y permite registrar el resultado al terminar
  if (partido) set("torneoRef", { torneo: torneo.nombretorneo, jornadaId: partido.jornadaId, partidoId: partido.id })

  for (const [team, eq] of [["A", equipoA], ["B", equipoB]]) {
    set(`head.team${team}`, eq.nombreequipo)
    set(`team${team}.name`, eq.nombreequipo) // el onChange de head.teamX no se dispara con setValue
    const coach = eq.cuerpotecnico.find((m) => m.cargo === CARGO_COACH)
    const asistente = eq.cuerpotecnico.find((m) => m.cargo === CARGO_ASISTENTE)
    set(`team${team}.coachName`, coach?.nombre ?? "")
    set(`team${team}.assistantCoachName`, asistente?.nombre ?? "")
    eq.roster.slice(0, MAX_JUGADORES_PLANILLA).forEach((j, i) => {
      set(`team${team}.players.${i}.name`, j.nombre)
      set(`team${team}.players.${i}.number`, j.dorsal)
    })
  }
}