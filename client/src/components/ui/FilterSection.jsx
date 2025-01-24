import React from 'react';
import { Search, X } from 'lucide-react';

const FilterSection = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  resetFilters,
  searchPlaceholder = "Search...",
  filterOptions = {}
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-4">
          {Object.entries(filterOptions).map(([key, options]) => (
            <select
              key={key}
              value={filters[key]}
              onChange={(e) => onFilterChange(key, e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ))}

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;