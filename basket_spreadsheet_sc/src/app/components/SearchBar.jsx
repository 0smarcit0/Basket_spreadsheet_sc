import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = "Buscar por nombre, ID o estado..." }) {
  return (
    <div className="relative w-full mb-6">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 dark:text-blue-500">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3 rounded-xl border border-blue-100 dark:border-gray-800 bg-blue-50/30 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-blue-300 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
      />
    </div>
  );
}