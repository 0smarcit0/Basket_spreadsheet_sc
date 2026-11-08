"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Download, Upload } from "lucide-react"
import Navbar from "../components/Navbar"
import useTorneos from "../utils/hooks/Usetorneos"
import {
  Aviso,
  Advertencia,
  ExportarTorneosModal,
  ExportarEquiposModal,
  ImportarTorneosModal,
  ImportarEquiposModal,
} from "../components/Settingsmodals"
import {
  exportarTorneosTxt,
  exportarEquiposTxt,
  exportarAppTxt,
  parseBackupApp,
  restaurarLocalStorage,
} from "../utils/backup"

function SettingsOption({ title, description, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      className="group flex w-full items-center rounded-2xl border border-blue-100 bg-white p-4 text-left transition-all duration-300 hover:border-blue-400 dark:border-gray-800 dark:bg-black dark:hover:border-blue-500"
      onClick={onClick}
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition-colors group-hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-900/50">
        <Icon size={24} strokeWidth={1.5} />
      </div>

      <div className="ml-4 flex-grow">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>

      <div className="flex-shrink-0 text-blue-300 transition-colors group-hover:text-blue-500 dark:text-blue-700 dark:group-hover:text-blue-400">
        <ChevronRight size={20} />
      </div>
    </button>
  )
}

export default function SettingsPage() {
  const { torneos, loaded, loadError, importTorneos, importEquipos, reemplazarTodo } = useTorneos()

  const [isDarkMode, setIsDarkMode] = useState(false)
  const [modal, setModal] = useState(null) // exportTorneos | exportEquipos | importTorneos | importEquipos | confirmApp
  const [archivo, setArchivo] = useState(null) // { nombre, texto }
  const [aviso, setAviso] = useState(null) // { titulo, mensaje, alAceptar? }

  const inputRef = useRef(null)
  const tipoPendiente = useRef(null) // "torneos" | "equipos" | "app"

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"))
  }, [])

  const toggleTheme = () => {
    const next = !isDarkMode
    document.documentElement.classList.toggle("dark", next)
    setIsDarkMode(next)
  }

  const cerrarModal = () => {
    setModal(null)
    setArchivo(null)
  }

  /* ───── Explorador de archivos ───── */
  // Debe llamarse directo desde un clic (requisito del navegador)
  const elegirArchivo = (tipo) => {
    tipoPendiente.current = tipo
    inputRef.current?.click()
  }

  const onArchivoElegido = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = "" // permite volver a elegir el mismo archivo
    if (!file) return

    let texto
    try {
      texto = await file.text()
    } catch {
      return setAviso({ titulo: "Error", mensaje: "No se pudo leer el archivo seleccionado." })
    }

    const tipo = tipoPendiente.current
    if (tipo === "app") return restaurarApp(texto)
    setArchivo({ nombre: file.name, texto })
    setModal(tipo === "torneos" ? "importTorneos" : "importEquipos")
  }

  /* ───── Datos de la aplicación ───── */
  const exportarApp = () => {
    if (!loaded || loadError) {
      return setAviso({
        titulo: "No se puede generar el respaldo",
        mensaje: loadError || "Los datos aún se están cargando. Inténtalo de nuevo en un momento.",
      })
    }
    try {
      const nombre = exportarAppTxt(torneos)
      setAviso({
        titulo: "Respaldo generado",
        mensaje: `Se descargó el archivo ${nombre}. Por seguridad, no incluye las credenciales de acceso.`,
      })
    } catch (err) {
      console.error(err)
      setAviso({ titulo: "Error", mensaje: "No se pudo generar el respaldo." })
    }
  }

  const restaurarApp = async (texto) => {
    try {
      const { local, torneos: lista } = parseBackupApp(texto)
      const res = await reemplazarTodo(lista) // primero los torneos: si falla, no se toca nada más
      if (!res.ok) throw new Error(res.error)
      restaurarLocalStorage(local)
      setAviso({
        titulo: "Datos restaurados",
        mensaje: "Los datos de la aplicación se cargaron correctamente. La página se recargará.",
        alAceptar: () => window.location.reload(),
      })
    } catch (err) {
      console.error(err)
      setAviso({ titulo: "No se pudo importar", mensaje: err.message })
    }
  }

  const opciones = [
    {
      title: "Exportar datos de la aplicación",
      description: "Exportar TODOS los datos de la aplicación para compartir o respaldar",
      icon: Download,
      onClick: exportarApp,
    },
    {
      title: "Importar datos de la aplicación",
      description: "Importar datos a la aplicación mediante un archivo de respaldo",
      icon: Upload,
      onClick: () => setModal("confirmApp"),
    },
    {
      title: "Exportar equipos seleccionados",
      description: "Exportar todos los datos de equipos seleccionados a un archivo",
      icon: Download,
      onClick: () => setModal("exportEquipos"),
    },
    {
      title: "Importar equipos",
      description: "Importar datos de equipos mediante un archivo de respaldo",
      icon: Upload,
      onClick: () => elegirArchivo("equipos"),
    },
    {
      title: "Exportar datos de torneos",
      description: "Exportar todos los datos de torneos seleccionados a un archivo",
      icon: Download,
      onClick: () => setModal("exportTorneos"),
    },
    {
      title: "Importar torneos",
      description: "Importar datos de torneos mediante un archivo de respaldo",
      icon: Upload,
      onClick: () => elegirArchivo("torneos"),
    },
  ]

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

        <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">Configuración</h1>

        {loadError && <p className="mb-3 text-sm text-red-600">{loadError}</p>}

        <div className="grid grid-cols-1 gap-3">
          {opciones.map((o) => (
            <SettingsOption key={o.title} {...o} />
          ))}
        </div>
      </main>

      {/* Selector de archivos compartido por todas las importaciones */}
      <input
        ref={inputRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        onChange={onArchivoElegido}
      />

      {modal === "exportTorneos" && (
        <ExportarTorneosModal torneos={torneos} onClose={cerrarModal} onExportar={exportarTorneosTxt} />
      )}
      {modal === "exportEquipos" && (
        <ExportarEquiposModal torneos={torneos} onClose={cerrarModal} onExportar={exportarEquiposTxt} />
      )}
      {modal === "importTorneos" && archivo && (
        <ImportarTorneosModal archivo={archivo} torneos={torneos} onClose={cerrarModal} onImportar={importTorneos} />
      )}
      {modal === "importEquipos" && archivo && (
        <ImportarEquiposModal archivo={archivo} torneos={torneos} onClose={cerrarModal} onImportar={importEquipos} />
      )}
      {modal === "confirmApp" && (
        <Advertencia
          onCancel={cerrarModal}
          onContinue={() => {
            cerrarModal()
            elegirArchivo("app") // se ejecuta dentro del clic de «Continuar»
          }}
          mensaje={
            <p>
              Los datos actuales de la aplicación (torneos, planilla guardada y demás) se sobrescribirán con los del
              archivo de respaldo. Esta acción no se puede deshacer.
            </p>
          }
        />
      )}

      {aviso && (
        <Aviso
          titulo={aviso.titulo}
          mensaje={aviso.mensaje}
          onClose={() => {
            setAviso(null)
            aviso.alAceptar?.()
          }}
        />
      )}
    </div>
  )
}