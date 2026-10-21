"use client"
import { Moon, Sun } from 'lucide-react';
import logo from '../../assets/logo_cabl.jpeg';

export default function Navbar({ isDarkMode, toggleTheme }) {
  return (
    <nav className="flex items-center justify-between p-4 border-b border-blue-50 dark:border-gray-800 bg-white dark:bg-black">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={logo.src}
          alt="Logo CABL"
          className="h-15 w-20 shrink-0 rounded-lg object-contain"
        />
        <span className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white leading-tight">
          CABL planilla de baloncesto
        </span>
      </div>

      {/*<button
        onClick={toggleTheme}
        className="ml-3 shrink-0 p-2 rounded-xl border border-blue-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
        aria-label="Alternar tema"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>*/}
    </nav>
  );
}