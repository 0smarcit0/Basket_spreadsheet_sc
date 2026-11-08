"use client"
import { useState } from "react"
import Modal from "./Modal"
import { parseExport, nombresRepetidos } from "../utils/backup"


const btnPrimario =
  "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
const btnSecundario =
  "rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
const btnPeligro =
  "rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
const selectCls =
  "w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"

/* ───────────── Piezas compartidas ───────────── */
export function Aviso({ titulo, mensaje, onClose }) {
  return (
    <Modal
      open
      title={titulo}
      size="sm"
      onClose={onClose}
      footer={<button type="button" onClick={onClose} className={btnPrimario}>Aceptar</button>}
    >
      <p className="text-sm">{mensaje}</p>
    </Modal>
  )
}

// Advertencia con Cancelar / Continuar
export function Advertencia({ mensaje, onCancel, onContinue, deshabilitado }) {
  return (
    <Modal
      open
      title="Advertencia"
      size="sm"
      onClose={onCancel}
      footer={
        <>
          <button type="button" onClick={onCancel} disabled={deshabilitado} className={btnSecundario}>Cancelar</button>
          <button type="button" onClick={onContinue} disabled={deshabilitado} className={btnPeligro}>Continuar</button>
        </>
      }
    >
      <div className="text-sm">{mensaje}</div>
    </Modal>
  )
}

function Casilla({ checked, onChange, children, className = "" }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${className}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-blue-600" />
      <span className="flex-1">{children}</span>
    </label>
  )
}

const conSet = (prev, claves, activar) => {
  const s = new Set(prev)
  claves.forEach((k) => (activar ? s.add(k) : s.delete(k)))
  return s
}

/* ───────────── Exportar torneos ───────────── */
export function ExportarTorneosModal({ torneos, onClose, onExportar }) {
  const [sel, setSel] = useState(() => new Set())
  const nombres = torneos.map((t) => t.nombretorneo)
  const todos = nombres.length > 0 && nombres.every((n) => sel.has(n))

  const exportar = () => {
    onExportar(torneos.filter((t) => sel.has(t.nombretorneo)))
    onClose()
  }

  return (
    <Modal
      open
      title="Exportar torneos"
      size="md"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnSecundario}>Cancelar</button>
          <button type="button" disabled={sel.size === 0} onClick={exportar} className={btnPrimario}>Exportar</button>
        </>
      }
    >
      {torneos.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No hay torneos registrados.</p>
      ) : (
        <>
          <Casilla checked={todos} onChange={() => setSel((p) => conSet(p, nombres, !todos))} className="font-medium">
            Seleccionar todos
          </Casilla>
          <hr className="my-2 border-gray-200 dark:border-gray-800" />
          {torneos.map((t) => (
            <Casilla key={t.nombretorneo} checked={sel.has(t.nombretorneo)} onChange={() => setSel((p) => conSet(p, [t.nombretorneo], !p.has(t.nombretorneo)))}>
              {t.nombretorneo}
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                {t.equipos.length} {t.equipos.length === 1 ? "equipo" : "equipos"}
              </span>
            </Casilla>
          ))}
        </>
      )}
    </Modal>
  )
}

/* ───────────── Exportar equipos (agrupados por torneo) ───────────── */
export function ExportarEquiposModal({ torneos, onClose, onExportar }) {
  const [sel, setSel] = useState(() => new Set())
  const key = (t, e) => JSON.stringify([t.nombretorneo, e.nombreequipo])

  const exportar = () => {
    const lista = torneos.flatMap((t) =>
      t.equipos.filter((e) => sel.has(key(t, e))).map((e) => ({ torneoOrigen: t.nombretorneo, ...e }))
    )
    onExportar(lista)
    onClose()
  }

  const hayEquipos = torneos.some((t) => t.equipos.length > 0)

  return (
    <Modal
      open
      title="Exportar equipos"
      size="md"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnSecundario}>Cancelar</button>
          <button type="button" disabled={sel.size === 0} onClick={exportar} className={btnPrimario}>Exportar</button>
        </>
      }
    >
      {!hayEquipos ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No hay equipos registrados.</p>
      ) : (
        <div className="space-y-4">
          {torneos.filter((t) => t.equipos.length > 0).map((t) => {
            const keys = t.equipos.map((e) => key(t, e))
            const todos = keys.every((k) => sel.has(k))
            return (
              <section key={t.nombretorneo}>
                <Casilla checked={todos} onChange={() => setSel((p) => conSet(p, keys, !todos))} className="font-semibold">
                  {t.nombretorneo}
                </Casilla>
                <div className="ml-6">
                  {t.equipos.map((e) => (
                    <Casilla key={e.nombreequipo} checked={sel.has(key(t, e))} onChange={() => setSel((p) => conSet(p, [key(t, e)], !p.has(key(t, e))))}>
                      {e.nombreequipo}
                    </Casilla>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

/* ───────────── Importar torneos ─────────────
   archivo: { nombre, texto } | onImportar(lista) -> Promise<{ ok, error? }> */
export function ImportarTorneosModal({ archivo, torneos, onClose, onImportar }) {
  const [aviso, setAviso] = useState(null) // { titulo, mensaje, cerrar? }
  const [datos, setDatos] = useState(null) // lista pendiente de confirmar
  const [conflictos, setConflictos] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const importar = async (lista) => {
    setProcesando(true)
    const res = await onImportar(lista)
    setProcesando(false)
    setConflictos(null)
    setAviso(
      res.ok
        ? { titulo: "Torneos importados", mensaje: `Se cargaron ${lista.length} ${lista.length === 1 ? "torneo" : "torneos"}.`, cerrar: true }
        : { titulo: "No se pudo importar", mensaje: res.error }
    )
  }

  const cargarDatos = async () => {
    let lista
    try {
      lista = parseExport(archivo.texto, "torneos")
    } catch (err) {
      return setAviso({ titulo: "Archivo no válido", mensaje: err.message })
    }
    const repetidos = nombresRepetidos(lista.map((t) => t?.nombretorneo), torneos.map((t) => t.nombretorneo))
    if (repetidos.length > 0) {
      setDatos(lista)
      return setConflictos(repetidos)
    }
    importar(lista)
  }

  return (
    <>
      <Modal
        open
        title="Importar torneos"
        size="md"
        onClose={onClose}
        footer={
          <>
            <button type="button" onClick={onClose} className={btnSecundario}>Cancelar</button>
            <button type="button" disabled={procesando} onClick={cargarDatos} className={btnPrimario}>Cargar datos</button>
          </>
        }
      >
        <p className="text-sm">
          Archivo seleccionado: <b className="break-all">{archivo.nombre}</b>
        </p>
      </Modal>

      {conflictos && (
        <Advertencia
          deshabilitado={procesando}
          onCancel={() => setConflictos(null)}
          onContinue={() => importar(datos)}
          mensaje={
            <>
              <p>Ya existen torneos con estos nombres: <b>{conflictos.join(", ")}</b>.</p>
              <p className="mt-2">Si continúa, serán sobrescritos con los datos del archivo.</p>
            </>
          }
        />
      )}

      {aviso && (
        <Aviso
          titulo={aviso.titulo}
          mensaje={aviso.mensaje}
          onClose={() => {
            setAviso(null)
            if (aviso.cerrar) onClose()
          }}
        />
      )}
    </>
  )
}

/* ───────────── Importar equipos ─────────────
   onImportar(nombreTorneo, lista) -> Promise<{ ok, error? }> */
export function ImportarEquiposModal({ archivo, torneos, onClose, onImportar }) {
  const [equipos, setEquipos] = useState(null) // lista cruda, tras "Cargar datos"
  const [destino, setDestino] = useState("")
  const [aviso, setAviso] = useState(null)
  const [conflictos, setConflictos] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const nombresArchivo = (equipos ?? []).map((e) => String(e?.nombreequipo ?? "").trim() || "(sin nombre)")

  const cargarDatos = () => {
    try {
      setEquipos(parseExport(archivo.texto, "equipos"))
    } catch (err) {
      setAviso({ titulo: "Archivo no válido", mensaje: err.message })
    }
  }

  const importar = async () => {
    setProcesando(true)
    const res = await onImportar(destino, equipos)
    setProcesando(false)
    setConflictos(null)
    setAviso(
      res.ok
        ? { titulo: "Equipos importados", mensaje: `Se cargaron ${equipos.length} ${equipos.length === 1 ? "equipo" : "equipos"} en «${destino}».`, cerrar: true }
        : { titulo: "No se pudo importar", mensaje: res.error }
    )
  }

  const continuar = () => {
    const torneo = torneos.find((t) => t.nombretorneo === destino)
    const repetidos = nombresRepetidos(nombresArchivo, torneo.equipos.map((e) => e.nombreequipo))
    if (repetidos.length > 0) return setConflictos(repetidos)
    importar()
  }

  return (
    <>
      <Modal
        open
        title="Importar equipos"
        size="md"
        onClose={onClose}
        footer={
          <>
            <button type="button" onClick={onClose} className={btnSecundario}>Cancelar</button>
            {equipos === null ? (
              <button type="button" onClick={cargarDatos} className={btnPrimario}>Cargar datos</button>
            ) : (
              <button type="button" disabled={!destino || procesando} onClick={continuar} className={btnPrimario}>Importar</button>
            )}
          </>
        }
      >
        <p className="text-sm">
          Archivo seleccionado: <b className="break-all">{archivo.nombre}</b>
        </p>

        {equipos !== null && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">
              Equipos encontrados ({nombresArchivo.length})
            </p>
            <ul className="mb-4 flex flex-wrap gap-2">
              {nombresArchivo.map((n, i) => (
                <li key={i} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800 dark:bg-gray-800 dark:text-blue-300">{n}</li>
              ))}
            </ul>

            {torneos.length === 0 ? (
              <p className="text-sm text-red-600">No hay torneos registrados. Crea uno antes de importar equipos.</p>
            ) : (
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Cargar en el torneo
                <select value={destino} onChange={(e) => setDestino(e.target.value)} className={`${selectCls} mt-1`}>
                  <option value="" disabled>Seleccione un torneo</option>
                  {torneos.map((t) => (
                    <option key={t.nombretorneo} value={t.nombretorneo}>{t.nombretorneo}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
      </Modal>

      {conflictos && (
        <Advertencia
          deshabilitado={procesando}
          onCancel={() => setConflictos(null)}
          onContinue={importar}
          mensaje={
            <>
              <p>En «{destino}» ya existen equipos con estos nombres: <b>{conflictos.join(", ")}</b>.</p>
              <p className="mt-2">Si continúa, los equipos existentes serán sobrescritos.</p>
            </>
          }
        />
      )}

      {aviso && (
        <Aviso
          titulo={aviso.titulo}
          mensaje={aviso.mensaje}
          onClose={() => {
            setAviso(null)
            if (aviso.cerrar) onClose()
          }}
        />
      )}
    </>
  )
}