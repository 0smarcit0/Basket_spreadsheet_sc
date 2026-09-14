import React, { useState, useEffect } from 'react';
import { Plus, Menu, Search, CircleQuestionMark,Settings } from 'lucide-react';
import Navbar from './components/Navbar';
import OptionButton from './components/OptionButton';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      console.log("Activando modo oscuro");
    } else {
      console.log("Desactivando modo oscuro");
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Funciones de ruteo/acción (Aquí enlazas con tus páginas)
  const handleNavigate = (path) => {
    console.log(`Navegando a: ${path}`);
    // Ejemplo: navigate(path) si usas react-router-dom
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans transition-colors duration-300">
      <div className="max-w-md mx-auto min-h-screen flex flex-col shadow-sm border-x border-gray-50 dark:border-gray-900 relative">
        
        <Navbar 
          isDarkMode={isDarkMode} 
          toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        />

        <main className="flex-grow p-6 flex flex-col">
          <div className="mb-8">
            <h2 className="text-blue-400 dark:text-blue-500 text-xs font-semibold tracking-wider uppercase mb-2">
              Bienvenido
            </h2>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              ¿Qué deseas hacer hoy?
            </h1>
          </div>

          <div className="flex-grow flex flex-col gap-1">
            <OptionButton
              title="Nueva planilla"
              description="Crear un nuevo registro desde cero"
              icon={Plus}
              onClick={() => handleNavigate('/nueva-planilla')}
            />
            
            <OptionButton
              title="Continuar última planilla"
              description="Retomar donde lo dejaste"
              icon={Menu}
              onClick={() => handleNavigate('/continuar-planilla')}
            />
            
            <OptionButton
              title="Consultar planillas"
              description="Buscar y revisar registros anteriores"
              icon={Search}
              onClick={() => handleNavigate('/consultar-planillas')}
            />

            <OptionButton
              title="Tutorial"
              description="Aclara tus dudas y aprende a usar la app"
              icon={CircleQuestionMark}
              onClick={() => handleNavigate('/tutorial')}
            />
            <OptionButton
              title="Configuracion"
              description="Personaliza tu experiencia y ajusta preferencias"
              icon={Settings}
              onClick={() => handleNavigate('/configuracion')}
            />
          </div>

          <div className="mt-8 text-center pb-6">
            <span className="text-xs text-blue-400 dark:text-blue-600 font-medium">
              Septiembre 2026
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}