import React, { useState } from 'react';
import { Building2, X, ChevronDown } from 'lucide-react';

const BookmakersFilter = ({
    selectedBookmakers,
    setSelectedBookmakers,
    bookmakerMapping,
    bookmakerOptions
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleBookmakerChange = (bookmaker) => {
        setSelectedBookmakers(prev => {
            if (prev.includes(bookmakerMapping[bookmaker])) {
                return prev.filter(b => b !== bookmakerMapping[bookmaker]);
            }
            return [...prev, bookmakerMapping[bookmaker]];
        });
    };

    const clearBookmakers = () => {
        setSelectedBookmakers([]);
    };

    const selectedCount = selectedBookmakers.length;
    const displayText = selectedCount > 0 
        ? `${selectedCount} bookmaker${selectedCount !== 1 ? 's' : ''} selected`
        : 'Select bookmakers';

    return (
        <div className="w-full bg-secondary-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-primary-500" />
                    <h3 className="text-sm font-medium text-secondary-200">Bookmakers</h3>
                </div>
                {selectedBookmakers.length > 0 && (
                    <button
                        onClick={clearBookmakers}
                        className="p-1 hover:bg-secondary-700 rounded-full transition-colors"
                        title="Clear bookmakers"
                    >
                        <X className="w-4 h-4 text-secondary-400" />
                    </button>
                )}
            </div>

            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-secondary-900 border border-secondary-700 rounded-lg px-4 py-2 text-left 
                    text-secondary-200 flex items-center justify-between hover:bg-secondary-800 transition-colors"
                >
                    <span className="text-sm">{displayText}</span>
                    <ChevronDown className={`w-4 h-4 text-secondary-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-secondary-900 border border-secondary-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                            {bookmakerOptions.map((bookmaker) => (
                                <label
                                    key={bookmaker}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-800 
                                    transition-colors cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedBookmakers.includes(bookmakerMapping[bookmaker])}
                                        onChange={() => handleBookmakerChange(bookmaker)}
                                        className="w-4 h-4 rounded border-secondary-600 text-primary-500 focus:ring-primary-500 
                                        bg-secondary-900 focus:ring-offset-secondary-900"
                                    />
                                    <span className="text-sm text-secondary-200">{bookmaker}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedBookmakers.length === 0 && (
                <div className="text-secondary-400 text-xs bg-secondary-700/50 border border-secondary-600 rounded-lg p-2 mt-2">
                    Select at least one bookmaker to filter results
                </div>
            )}
        </div>
    );
};

export default BookmakersFilter;
