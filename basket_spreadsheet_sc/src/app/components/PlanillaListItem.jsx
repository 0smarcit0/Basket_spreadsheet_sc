import React from 'react';

export default function PlanillaListItem({ title, id, date, status, torneo }) {
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'completada':
        return 'text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-500/50';
      case 'en progreso':
        return 'text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-500/50';
      case 'pendiente':
        return 'text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-500/50';
      case 'suspendido':
        return 'text-orange-600 border-orange-300 dark:text-orange-400 dark:border-orange-500/50';
      default:
        return 'text-gray-600 border-gray-300 dark:text-gray-400 dark:border-gray-600';
    }
  };
  const splitedtitle = title.split("_");
  const formattitle = `${splitedtitle[1]} ${splitedtitle[2]} ${splitedtitle[3]}`;

  // Función para abreviar o cortar nombres de torneos largos (ej. "Torneo Apertura de Baloncesto 2026" -> "Torneo Apertura...")
  const formatTorneo = (text, maxLength = 22) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  console.log(title)

  return (
    <div className="flex items-center p-4 mb-3 rounded-2xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-black hover:border-blue-300 dark:hover:border-gray-600 transition-colors cursor-pointer group">
      
      <div className="ml-4 flex-grow min-w-0">
        <h3 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight truncate">
          {formattitle}
        </h3>
        
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <p className="text-[13px] text-gray-400 dark:text-gray-500">
            {date}
          </p>

          {torneo && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 truncate max-w-[140px]" title={torneo}>
              {formatTorneo(torneo)}
            </span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 ml-2">
        <span className={`px-3 py-1 rounded-full text-[11px] font-medium border ${getStatusStyles(status)}`}>
          {status}
        </span>
      </div>
    </div>
  );
}