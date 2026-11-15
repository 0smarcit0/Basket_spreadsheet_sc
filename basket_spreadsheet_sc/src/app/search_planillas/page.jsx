"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import PlanillaListItem from '../components/PlanillaListItem';
import Link from 'next/link';
import { listarArchivosPlanillas, leerArchivoComoJSON } from '../utils/planillasIO';
import { useRouter } from 'next/navigation';
export default function ConsultarPlanillas() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [planillas, setPlanillas] = useState([]);
  const [loading, setLoading] = useState(true);


  const handleSelectPlanilla = (fileName) => {
    // Usamos query params para mantener la ruta estática y compatible con PWA offline
    router.push(`/continue_planilla?file=${encodeURIComponent(fileName)}`);
  };

  // Cargar las planillas desde el OPFS al montar el componente
  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        const archivos = await listarArchivosPlanillas();
        const planillasCargadas = [];

        for (const fileName of archivos) {
          try {
            const planilla = await leerArchivoComoJSON(fileName);
            // Aseguramos que tenga un identificador de archivo o nombre si no viene en el JSON
            
            planillasCargadas.push({
              fileName,
              title: planilla.title || fileName.replace('.txt', ''),
              id: planilla.id || fileName,
              date: planilla.date || '',
              status: planilla.status || 'Finalizada',
              ...planilla
            });
          } catch (err) {
            console.error(`No se pudo parsear el archivo ${fileName}:`, err);
          }
        }

        setPlanillas(planillasCargadas);
      } catch (error) {
        console.error("Error al listar las planillas del OPFS:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
    
  }, []);

  // Filtrado reactivo basado en el término de búsqueda
  const filteredPlanillas = planillas.filter(planilla => {
    const titleMatch = planilla.title?.toLowerCase().includes(searchTerm.toLowerCase());
    //const idMatch = planilla.id?.toLowerCase().includes(searchTerm.toLowerCase());
    //const statusMatch = planilla.status?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch /*|| idMatch || statusMatch;*/
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto flex flex-col h-full p-4 sm:p-6 md:p-8">
        <Link
          href="/"
          className="flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm sm:text-base mb-6 transition-colors w-fit"
        >
          <ArrowLeft size={16} className="mr-1" />
          Inicio
        </Link>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Consultar planillas
        </h1>

        <div className="w-full max-w-2xl mb-6">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <span className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            {loading
              ? "Cargando planillas..."
              : `${filteredPlanillas.length} resultados`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-y-auto pb-4 scrollbar-hide">
          {!loading &&
            filteredPlanillas.map((planilla) => (
              <div
                key={planilla.fileName}
                onClick={() => handleSelectPlanilla(planilla.fileName)}
              >
                <PlanillaListItem
                  title={planilla.title}
                  id={planilla.id}
                  date={planilla.title.split("_")[5]}
                  status={planilla.status}
                  torneo={planilla.title.split("_")[4]}
                />
              </div>
            ))}

          {!loading && filteredPlanillas.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 md:text-lg">
              No se encontraron resultados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}