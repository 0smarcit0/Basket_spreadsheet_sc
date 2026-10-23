"use client";
import {useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Menu, Search, CircleQuestionMark, Settings, Trophy } from 'lucide-react';
import Navbar from './components/Navbar';
import OptionButton from './components/OptionButton';
import Modal from './components/Modal';
import { loadSheet } from './utils/saveSheet';

export default function App() {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [confirmNewOpen, setConfirmNewOpen] = useState(false);

    useEffect(() => {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        console.log("Activando modo oscuro");
      }  else {
        console.log("Desactivando modo oscuro");
        document.documentElement.classList.remove('dark');
      }
    }, [isDarkMode]);

    // Si ya hay una planilla guardada, frena la navegación y pide confirmación.
    // Si no hay nada guardado, el Link navega normalmente.
    const handleNewSheetClick = (e) => {
      if (!loadSheet()) return;
      e.preventDefault();
      setConfirmNewOpen(true);
    };

    const confirmNewSheet = () => {
      setConfirmNewOpen(false);
      router.push('/new_planilla');
    };

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans transition-colors duration-300 flex flex-col">
      <div className="w-full max-w-6xl mx-auto min-h-screen flex flex-col shadow-none sm:shadow-sm sm:border-x border-gray-100 dark:border-gray-900 relative">
        <Navbar
          isDarkMode={isDarkMode}
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
        />

        <main className="flex-grow p-4 sm:p-6 md:p-8 flex flex-col">
          <div className="mb-8 md:mb-10">
            <h2 className="text-blue-500 dark:text-blue-400 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-2">
              Bienvenido
            </h2>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              ¿Qué deseas hacer hoy?
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-start">
            <OptionButton
              title="Nueva planilla"
              description="Crear un nuevo registro desde cero"
              icon={Plus}
              path="/new_planilla"
              onclick={handleNewSheetClick}
            />

            <OptionButton
              title="Continuar última planilla"
              description="Retomar donde lo dejaste"
              icon={Menu}
              path="/continue_planilla"
            />

            {/*<OptionButton
              title="Consultar planillas"
              description="Buscar y revisar registros anteriores"
              icon={Search}
              path="/search_planillas"
            />*/}

            {/*<OptionButton
              title="Tutorial"
              description="Aclara tus dudas y aprende a usar la app"
              icon={CircleQuestionMark}
              path="/search_planillas"
            />*/}
            {/*<OptionButton
              title="Configuración"
              description="Personaliza tu experiencia y ajusta preferencias"
              icon={Settings}
              path="/search_planillas"
            />*/}
            <OptionButton
              title="Torneos"
              description="Gestionar torneos y competencias"
              icon={Trophy}
              path="/torneos"
            />
          </div>

          <div className="mt-auto pt-8 md:pt-12 text-center pb-6">
            <p className="text-xs sm:text-sm text-blue-500 dark:text-blue-400 font-medium">
              Círculo de árbitros de baloncesto libertador
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Desarrollado por Osmar Porras 2026
            </p>
          </div>
        </main>
      </div>

      <Modal
        open={confirmNewOpen}
        onClose={() => setConfirmNewOpen(false)}
        title="Advertencia"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmNewOpen(false)}
              className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmNewSheet}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Continuar
            </button>
          </>
        }
      >
        <p>
          Ya existe una planilla guardada. Si continúa, se sobrescribirá en
          cuanto empiece a modificar la nueva planilla.
        </p>
      </Modal>
    </div>
  );
}