import React from 'react';
import { Search, X, Calendar } from 'lucide-react';

const FilterSection = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  resetFilters,
  searchPlaceholder = "Search...",
  filterOptions = {},
  children
}) => {
  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-dark-accent mb-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-dark-accent rounded-lg 
            text-gray-600 dark:text-dark-text 
            placeholder-gray-400 dark:placeholder-gray-500 
            bg-white dark:bg-dark-card 
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-4">
          {Object.entries(filterOptions).map(([key, options]) => (
            <select
              key={key}
              value={filters[key]}
              onChange={(e) => onFilterChange(key, e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-dark-accent rounded-lg 
              text-gray-600 dark:text-dark-text 
              bg-white dark:bg-dark-card 
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="">All {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ))}

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 
            bg-gray-50 dark:bg-dark-accent 
            rounded-lg text-gray-600 dark:text-dark-text 
            hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Optional additional content (for date ranges, etc.) */}
      {children}
    </div>
  );
};

export default FilterSection;