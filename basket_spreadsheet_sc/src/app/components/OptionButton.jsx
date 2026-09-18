import React from 'react';
import { ChevronRight } from 'lucide-react';
import  Link from 'next/link';

export default function OptionButton({ title, description, icon: Icon, path, isActive }) {
  return (
    <Link
      href={path}
      className={`w-full flex items-center p-4 mb-4 rounded-2xl text-left transition-all duration-300 group
        ${isActive 
          ? 'border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-black' 
          : 'border border-blue-100 dark:border-gray-800 bg-white dark:bg-black hover:border-blue-400 dark:hover:border-blue-500'
        }`}
    >
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
        <Icon size={24} strokeWidth={1.5} />
      </div>

      <div className="ml-4 flex-grow">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      </div>

      <div className="flex-shrink-0 text-blue-300 dark:text-blue-700 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
        <ChevronRight size={20} />
      </div>
    </Link>
  );
}