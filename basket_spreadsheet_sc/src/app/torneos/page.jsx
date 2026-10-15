"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Check, X, Plus } from "lucide-react"
import Navbar from "../components/Navbar"
import Modal from "../components/Modal"
import useTorneos from "../utils/hooks/useTorneos"

export default function TorneosPage() {
  const { torneos, loaded, addTorneo, updateTorneo, removeTorneo } = useTorneos()

  const [isDarkMode, setIsDarkMode] = useState(false)
  const [nuevo, setNuevo] = useState("")
  const [error, setError] = useState("")
  const [editando, setEditando] = useState(null) // nombre que se está editando
  const [valorEdit, setValorEdit] = useState("")
  const [aBorrar, setABorrar] = useState(null)

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"))
  }, [])

  const toggleTheme = () => {
    const next = !isDarkMode
    document.documentElement.classList.toggle("dark", next)
    setIsDarkMode(next)
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!nuevo.trim()) return setError("El nombre no puede estar vacío.")
    if (!addTorneo(nuevo)) return setError("Ese torneo ya existe.")
    setNuevo("")
    setError("")
  }

  const startEdit = (t) => {
    setEditando(t)
    setValorEdit(t)
    setError("")
  }

  const saveEdit = () => {
    if (!updateTorneo(editando, valorEdit)) {
      return setError("Nombre vacío o ya existente.")
    }
    setEditando(null)
    setError("")
  }

  const cancelEdit = () => {
    setEditando(null)
    setError("")
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

        <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
          Torneos
        </h1>

        {/* Crear */}
        <form onSubmit={handleAdd} className="mb-2 flex gap-2">
          <input
            type="text"
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            placeholder="Nombre del torneo"
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Agregar
          </button>
        </form>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        {/* Listar */}
        {!loaded ? null : torneos.length === 0 ? (
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Aún no hay torneos. Agrega el primero arriba.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-200 rounded-md bg-white shadow-sm dark:divide-gray-800 dark:bg-gray-950">
            {torneos.map((t) => (
              <li key={t} className="flex items-center gap-2 px-3 py-2">
                {editando === t ? (
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
                    <span className="flex-1 text-sm text-gray-800 dark:text-gray-100">{t}</span>
                    <button type="button" onClick={() => startEdit(t)} aria-label="Editar"
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => setABorrar(t)} aria-label="Eliminar"
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

      {aBorrar && (
        <Modal
          open
          onClose={() => setABorrar(null)}
          title="Eliminar torneo"
          size="sm"
          footer={
            <button
              type="button"
              onClick={() => { removeTorneo(aBorrar); setABorrar(null) }}
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