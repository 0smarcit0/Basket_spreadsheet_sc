"use client";
import {useState, useEffect} from 'react';
import { Plus, Menu, Search, CircleQuestionMark, Settings } from 'lucide-react';
import Navbar from './components/Navbar';
import OptionButton from './components/OptionButton';

export default function App() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        console.log("Activando modo oscuro");
      }  else {
        console.log("Desactivando modo oscuro");
        document.documentElement.classList.remove('dark');
      }
    }, [isDarkMode]);

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

          <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <OptionButton
              title="Nueva planilla"
              description="Crear un nuevo registro desde cero"
              icon={Plus}
              path="/new_planilla"
            />
            
            <OptionButton
              title="Continuar última planilla"
              description="Retomar donde lo dejaste"
              icon={Menu}
              path="/search_planillas"
            />
            
            <OptionButton
              title="Consultar planillas"
              description="Buscar y revisar registros anteriores"
              icon={Search}
              path="/search_planillas"
            />

            <OptionButton
              title="Tutorial"
              description="Aclara tus dudas y aprende a usar la app"
              icon={CircleQuestionMark}
              path="/search_planillas"
            />
            <OptionButton
              title="Configuración"
              description="Personaliza tu experiencia y ajusta preferencias"
              icon={Settings}
              path="/search_planillas"
            />
          </div>

          <div className="mt-8 md:mt-12 text-center pb-6">
            <span className="text-xs sm:text-sm text-blue-500 dark:text-blue-400 font-medium">
              Septiembre 2026
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}