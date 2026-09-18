import React from 'react';
import { Moon, Sun, Table2 } from 'lucide-react';

export default function Navbar({ isDarkMode, toggleTheme }) {
  return (
    <nav className="flex items-center justify-between p-4 border-b border-blue-50 dark:border-gray-800 bg-white dark:bg-black">
      <div className="flex items-center gap-2">
        <div className="bg-blue-500 text-white p-1.5 rounded-lg">
          <Table2 size={20} />
        </div>
        <span className="font-bold text-lg text-gray-900 dark:text-white">
          PlanillaApp
        </span>
      </div>

      <button
        onClick={toggleTheme}
        className="p-2 rounded-xl border border-blue-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
        aria-label="Alternar tema"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </nav>
  );
}