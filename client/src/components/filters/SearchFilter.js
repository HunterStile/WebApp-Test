import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

const SearchFilter = ({ 
    searchTerm, 
    setSearchTerm, 
    suggestions, 
    setSuggestions,
    showSuggestions,
    setShowSuggestions
}) => {
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim()) {
            setSuggestions(prev => 
                prev.filter(match => 
                    match.toLowerCase().includes(value.toLowerCase())
                )
            );
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        setShowSuggestions(false);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="w-full bg-secondary-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-primary-500" />
                    <h3 className="text-sm font-medium text-secondary-200">Search Matches</h3>
                </div>
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        className="p-1 hover:bg-secondary-700 rounded-full transition-colors"
                        title="Clear search"
                    >
                        <X className="w-4 h-4 text-secondary-400" />
                    </button>
                )}
            </div>

            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search for matches..."
                        className="w-full bg-secondary-900 border border-secondary-700 rounded-lg pl-10 pr-4 py-2 text-secondary-100 
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        placeholder-secondary-500 text-sm"
                    />
                </div>

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-secondary-900 border border-secondary-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-4 py-2 text-left text-sm text-secondary-200 hover:bg-secondary-800 
                                transition-colors flex items-center space-x-2"
                            >
                                <Search className="w-4 h-4 text-secondary-400" />
                                <span>{suggestion}</span>
                            </button>
                        ))}
                    </div>
                )}

                {searchTerm && suggestions.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-secondary-900 border border-secondary-700 rounded-lg shadow-lg p-4">
                        <div className="text-secondary-400 text-sm text-center">
                            No matches found
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchFilter; 