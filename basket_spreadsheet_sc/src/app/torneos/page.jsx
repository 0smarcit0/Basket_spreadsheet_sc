"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import Navbar from "../components/Navbar"
import { CrearTorneoModal, DetalleTorneoModal } from "../components/Torneomodals"
import useTorneos from "../utils/hooks/useTorneos"

export default function TorneosPage() {
  const { torneos, loaded, loadError, addTorneo, renameTorneo, removeTorneo, updateEquipo, addEquipo,
    iniciarTorneo, generarJornada, generarFaseEliminatoria, finalizarJornada, realizarSorteo, retirarEquipo } =
    useTorneos()

  const [isDarkMode, setIsDarkMode] = useState(false)
  const [creando, setCreando] = useState(false)
  const [torneoSel, setTorneoSel] = useState(null) // nombre del torneo abierto

  const torneoAbierto = torneos.find((t) => t.nombretorneo === torneoSel)

  const toggleTheme = () => {
    const next = !isDarkMode
    document.documentElement.classList.toggle("dark", next)
    setIsDarkMode(next)
  }

  // Al renombrar hay que seguir apuntando al torneo con su nombre nuevo
  const handleRename = async (viejo, nuevo) => {
    const res = await renameTorneo(viejo, nuevo)
    if (res.ok) setTorneoSel(nuevo.trim())
    return res
  }

  const handleRemove = async (nombre) => {
    const res = await removeTorneo(nombre)
    if (res.ok) setTorneoSel(null)
    return res
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

        {!loaded ? null : torneos.length === 0 ? (
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Aún no hay torneos. Crea el primero con «Nuevo torneo».
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-200 rounded-md bg-white shadow-sm dark:divide-gray-800 dark:bg-gray-950">
            {torneos.map((t) => (
              <li key={t.nombretorneo} className="flex items-center gap-3 px-3 py-2">
                <span className="flex-1 text-sm text-gray-800 dark:text-gray-100">
                  {t.nombretorneo}
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {t.equipos.length} {t.equipos.length === 1 ? "equipo" : "equipos"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setTorneoSel(t.nombretorneo)}
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Detalles
                </button>
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
          onRenameTorneo={handleRename}
          onRemoveTorneo={handleRemove}
          onUpdateEquipo={updateEquipo}
          onAddEquipo={addEquipo}
          onIniciarTorneo={iniciarTorneo}
          onGenerarJornada={generarJornada}
          onGenerarFase={generarFaseEliminatoria}
          onFinalizarJornada={finalizarJornada}
          onRealizarSorteo={realizarSorteo}
          onRetirarEquipo={retirarEquipo}
        />
      )}
    </div>
  )
}