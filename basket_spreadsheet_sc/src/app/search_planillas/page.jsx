"use client";
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import PlanillaListItem from '../components/PlanillaListItem';
import Link from 'next/link';

const planillasData = [
  { id: 'PL-001', title: 'Planilla Enero 2026', date: '01/01/2026', status: 'Completada' },
  { id: 'PL-002', title: 'Planilla Febrero 2026', date: '01/02/2026', status: 'En progreso' },
  { id: 'PL-003', title: 'Planilla Marzo 2026', date: '01/03/2026', status: 'Completada' },
  { id: 'PL-004', title: 'Planilla Abril 2026', date: '01/04/2026', status: 'Pendiente' },
  { id: 'PL-005', title: 'Planilla Mayo 2026', date: '01/05/2026', status: 'Completada' },
  { id: 'PL-006', title: 'Planilla Junio 2026', date: '01/06/2026', status: 'En progreso' },
];

export default function ConsultarPlanillas() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlanillas = planillasData.filter(planilla => 
    planilla.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    planilla.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    planilla.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {filteredPlanillas.length} resultados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-y-auto pb-4 scrollbar-hide">
          {filteredPlanillas.map((planilla) => (
            <PlanillaListItem
              key={planilla.id}
              title={planilla.title}
              id={planilla.id}
              date={planilla.date}
              status={planilla.status}
            />
          ))}
          
          {filteredPlanillas.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 md:text-lg">
              No se encontraron resultados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}