"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Check, X, Plus } from "lucide-react"
import Navbar from "../components/Navbar"
import Modal from "../components/Modal"
import { CrearTorneoModal, DetalleTorneoModal } from "../components/Torneomodals"
import useTorneos from "../utils/hooks/useTorneos"

export default function TorneosPage() {
  const { torneos, loaded, loadError, addTorneo, renameTorneo, removeTorneo, updateEquipo, addEquipo,
    iniciarTorneo, generarJornada, finalizarJornada, realizarSorteo } =
    useTorneos()

  const [isDarkMode, setIsDarkMode] = useState(false)
  const [error, setError] = useState("")
  const [creando, setCreando] = useState(false)
  const [torneoSel, setTorneoSel] = useState(null) // nombre del torneo abierto
  const [editando, setEditando] = useState(null) // nombre que se está renombrando
  const [valorEdit, setValorEdit] = useState("")
  const [aBorrar, setABorrar] = useState(null)

  const torneoAbierto = torneos.find((t) => t.nombretorneo === torneoSel)

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"))
  }, [])

  const toggleTheme = () => {
    const next = !isDarkMode
    document.documentElement.classList.toggle("dark", next)
    setIsDarkMode(next)
  }

  const startEdit = (nombre) => {
    setEditando(nombre)
    setValorEdit(nombre)
    setError("")
  }

  const saveEdit = async () => {
    const res = await renameTorneo(editando, valorEdit)
    if (!res.ok) return setError(res.error)
    setEditando(null)
    setError("")
  }

  const cancelEdit = () => {
    setEditando(null)
    setError("")
  }

  const confirmarBorrado = async () => {
    const res = await removeTorneo(aBorrar)
    setError(res.ok ? "" : res.error)
    setABorrar(null)
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-100 dark:bg-gray-900">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="mx-auto w-full max-w-2xl flex-1 overflow-auto px-4 py-6">
        <Link
          href="/"
          className="mb-4 flex w-fit items-center text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400"
        >
          <ArrowLeft size={16} className="mr-1" />
          Inicio
        </Link>

        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Torneos</h1>
          <button
            type="button"
            onClick={() => setCreando(true)}
            disabled={!!loadError}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={16} /> Nuevo torneo
          </button>
        </div>

        {loadError && <p className="mb-2 text-sm text-red-600">{loadError}</p>}
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        {!loaded ? null : torneos.length === 0 ? (
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Aún no hay torneos. Crea el primero con «Nuevo torneo».
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-200 rounded-md bg-white shadow-sm dark:divide-gray-800 dark:bg-gray-950">
            {torneos.map((t) => (
              <li key={t.nombretorneo} className="flex items-center gap-2 px-3 py-2">
                {editando === t.nombretorneo ? (
                  <>
                    <input
                      autoFocus
                      value={valorEdit}
                      onChange={(e) => setValorEdit(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit()
                        if (e.key === "Escape") cancelEdit()
                      }}
                      className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                    <button type="button" onClick={saveEdit} aria-label="Guardar"
                      className="rounded p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-gray-800">
                      <Check size={16} />
                    </button>
                    <button type="button" onClick={cancelEdit} aria-label="Cancelar"
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setTorneoSel(t.nombretorneo)}
                      className="flex-1 text-left text-sm text-gray-800 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                    >
                      {t.nombretorneo}
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {t.equipos.length} {t.equipos.length === 1 ? "equipo" : "equipos"}
                      </span>
                    </button>
                    <button type="button" onClick={() => startEdit(t.nombretorneo)} aria-label="Renombrar"
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => setABorrar(t.nombretorneo)} aria-label="Eliminar"
                      className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-gray-800">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {creando && <CrearTorneoModal onClose={() => setCreando(false)} onCreate={addTorneo} />}

      {torneoAbierto && (
        <DetalleTorneoModal
          torneo={torneoAbierto}
          onClose={() => setTorneoSel(null)}
          onUpdateEquipo={updateEquipo}
          onAddEquipo={addEquipo}
          onIniciarTorneo={iniciarTorneo}
          onGenerarJornada={generarJornada}
          onFinalizarJornada={finalizarJornada}
          onRealizarSorteo={realizarSorteo}
        />
      )}

      {aBorrar && (
        <Modal
          open
          onClose={() => setABorrar(null)}
          title="Eliminar torneo"
          size="sm"
          footer={
            <button
              type="button"
              onClick={confirmarBorrado}
              className="rounded-md px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-800"
            >
              Eliminar
            </button>
          }
        >
          <p>¿Seguro que deseas eliminar "{aBorrar}"?</p>
        </Modal>
      )}
    </div>
  )
}