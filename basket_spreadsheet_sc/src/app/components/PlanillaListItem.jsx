import React from 'react';
import { Layout } from 'lucide-react';

export default function PlanillaListItem({ title, id, date, status }) {
  const getStatusStyles = (status) => {
    switch (status.toLowerCase()) {
      case 'completada':
        return 'text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-500/50';
      case 'en progreso':
        return 'text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-500/50';
      case 'pendiente':
        return 'text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-500/50';
      default:
        return 'text-gray-600 border-gray-300 dark:text-gray-400 dark:border-gray-600';
    }
  };

  return (
    <div className="flex items-center p-4 mb-3 rounded-2xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-black hover:border-blue-300 dark:hover:border-gray-600 transition-colors cursor-pointer group">
      
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-400 dark:text-blue-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
        <Layout size={20} strokeWidth={1.5} />
      </div>

      <div className="ml-4 flex-grow">
        <h3 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
          {title}
        </h3>
        <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">
          {id} · {date}
        </p>
      </div>

      <div className="flex-shrink-0 ml-2">
        <span className={`px-3 py-1 rounded-full text-[11px] font-medium border ${getStatusStyles(status)}`}>
          {status}
        </span>
      </div>
    </div>
  );
}