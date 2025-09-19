'use client';

import { ClassType } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface SearchAndFiltersProps {
  onSearchChange: (search: string) => void;
  onClassFilter: (classType: ClassType | 'all') => void;
  onConnectionsFilter: (showConnections: boolean) => void;
  currentSearch: string;
  currentClassFilter: ClassType | 'all';
  currentConnectionsFilter: boolean;
}

export default function SearchAndFilters({ onSearchChange, onClassFilter, onConnectionsFilter, currentSearch, currentClassFilter, currentConnectionsFilter }: SearchAndFiltersProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg p-6 mb-6">
      <div className="w-full text-xl mb-2 mx-auto text-center text-gray-500">{t('filters.title')}</div>

      <div className="flex flex-wrap lg:flex-row gap-2 lg:items-center justify-center">
        {/* Search */}
        {/* <div className="lg:flex-5/12 md:flex-1 grow min-w-xl"> */}
        <div className="lg:basis-3/5 basis-full grow">
          <label
            htmlFor="search"
            className="sr-only"
          >
            Search families
          </label>
          <input
            type="text"
            id="search"
            placeholder={t('filters.searchPlaceholder')}
            value={currentSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border bg-white border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 "
          />
        </div>

        {/* Class Filter */}
        {/* <div className="flex-1/12"> */}
        <div className="lg:basis-1/8">
          <label
            htmlFor="class-filter"
            className="sr-only"
          >
            Filter by class
          </label>
          <select
            id="class-filter"
            value={currentClassFilter}
            onChange={(e) => onClassFilter(e.target.value as ClassType | 'all')}
            className="px-4 py-2 border border-gray-200 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">{t('filters.allClasses')}</option>
            <option value="Pegasus">{t('classes.Pegasus')}</option>
            <option value="Lynx">{t('classes.Lynx')}</option>
            <option value="Orion">{t('classes.Orion')}</option>
            <option value="Andromeda">{t('classes.Andromeda')}</option>
          </select>
        </div>

        {/* Connections Filter */}
        {/* <div className="flex items-center gap-2 flex-4/12"> */}
        <div className="flex items-center gap-2 lg:basis-1/5 h-10">
          <input
            type="checkbox"
            id="connections-filter"
            checked={currentConnectionsFilter}
            onChange={(e) => onConnectionsFilter(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="connections-filter"
            className="text-sm font-medium text-gray-900"
          >
            {t('filters.networkingOnly')}
          </label>
        </div>

        {/* Clear Filters */}
        {(currentSearch || currentClassFilter !== 'all' || currentConnectionsFilter) && (
          <button
            onClick={() => {
              onSearchChange('');
              onClassFilter('all');
              onConnectionsFilter(false);
            }}
            className="flex-shrink-0 px-4 py-2 text-sm text-gray-900 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 bg-white"
          >
            {t('filters.clearFilters')}
          </button>
        )}
      </div>
    </div>
  );
}
