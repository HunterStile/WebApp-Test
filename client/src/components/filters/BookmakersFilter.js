import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const BookmakersFilter = ({
    selectedBookmakers,
    setSelectedBookmakers,
    bookmakerMapping,
    bookmakerOptions
}) => {
    const [isBookmakersOpen, setIsBookmakersOpen] = useState(false);
    const [isExchangeOpen, setIsExchangeOpen] = useState(false);

    // Separa i bookmaker tra normali ed exchange
    const exchangeOptions = bookmakerOptions.filter(book =>
        book.toLowerCase().includes('betfair')
    );
    const regularBookmakers = bookmakerOptions.filter(book =>
        !book.toLowerCase().includes('betfair')
    );

    // Crea mapping separati
    const exchangeMapping = Object.fromEntries(
        Object.entries(bookmakerMapping).filter(([key]) =>
            key.toLowerCase().includes('betfair')
        )
    );
    const regularMapping = Object.fromEntries(
        Object.entries(bookmakerMapping).filter(([key]) =>
            !key.toLowerCase().includes('betfair')
        )
    );

    // Filtra le selezioni correnti
    const selectedExchange = selectedBookmakers.filter(book =>
        Object.values(exchangeMapping).includes(book)
    );
    const selectedRegular = selectedBookmakers.filter(book =>
        Object.values(regularMapping).includes(book)
    );

    const handleRegularBookmakerChange = (e) => {
        const { value, checked } = e.target;
        const bookmakerKey = regularMapping[value];
        setSelectedBookmakers(prevState => {
            if (checked) {
                return [...prevState, bookmakerKey];
            } else {
                return prevState.filter(bookmaker => bookmaker !== bookmakerKey);
            }
        });
    };

    const handleExchangeChange = (e) => {
        const { value, checked } = e.target;
        const bookmakerKey = exchangeMapping[value];
        setSelectedBookmakers(prevState => {
            if (checked) {
                return [...prevState, bookmakerKey];
            } else {
                return prevState.filter(bookmaker => bookmaker !== bookmakerKey);
            }
        });
    };

    const handleSelectAllRegular = (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            setSelectedBookmakers(prev => [
                ...prev.filter(book => Object.values(exchangeMapping).includes(book)),
                ...Object.values(regularMapping)
            ]);
        } else {
            setSelectedBookmakers(prev =>
                prev.filter(book => Object.values(exchangeMapping).includes(book))
            );
        }
    };

    const handleSelectAllExchange = (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            setSelectedBookmakers(prev => [
                ...prev.filter(book => Object.values(regularMapping).includes(book)),
                ...Object.values(exchangeMapping)
            ]);
        } else {
            setSelectedBookmakers(prev =>
                prev.filter(book => Object.values(regularMapping).includes(book))
            );
        }
    };

    return (
        <div className="w-full">
            <h3 className="text-sm text-slate-400 mb-2">Filter by Bookmakers</h3>
            <div className="space-y-4">
                {/* Regular Bookmakers Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-300">
                            Bookmakers ({selectedRegular.length})
                        </h3>
                    </div>

                    <div
                        className="w-full p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors duration-200"
                        onClick={() => setIsBookmakersOpen(!isBookmakersOpen)}
                    >
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAllRegular}
                                    checked={selectedRegular.length === Object.values(regularMapping).length}
                                    className="w-4 h-4 rounded border-slate-500 text-purple-500 focus:ring-purple-500/50 bg-slate-600"
                                />
                                <span className="text-sm text-slate-300">Select/Deselect All</span>
                            </label>
                            <ChevronDown
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isBookmakersOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </div>
                    </div>

                    {isBookmakersOpen && (
                        <div className="mt-2 space-y-2 p-3 bg-slate-800 rounded-lg border border-slate-700">
                            {regularBookmakers.map((bookmaker, index) => (
                                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={bookmaker}
                                        checked={selectedBookmakers.includes(regularMapping[bookmaker])}
                                        onChange={handleRegularBookmakerChange}
                                        className="w-4 h-4 rounded border-slate-500 text-purple-500 focus:ring-purple-500/50 bg-slate-600"
                                    />
                                    <span className="text-sm text-slate-300">{bookmaker}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Exchange Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-300">
                            Exchange ({selectedExchange.length})
                        </h3>
                    </div>

                    <div
                        className="w-full p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors duration-200"
                        onClick={() => setIsExchangeOpen(!isExchangeOpen)}
                    >
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAllExchange}
                                    checked={selectedExchange.length === Object.values(exchangeMapping).length}
                                    className="w-4 h-4 rounded border-slate-500 text-purple-500 focus:ring-purple-500/50 bg-slate-600"
                                />
                                <span className="text-sm text-slate-300">Select/Deselect All</span>
                            </label>
                            <ChevronDown
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExchangeOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </div>
                    </div>

                    {isExchangeOpen && (
                        <div className="mt-2 space-y-2 p-3 bg-slate-800 rounded-lg border border-slate-700">
                            {exchangeOptions.map((bookmaker, index) => (
                                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={bookmaker}
                                        checked={selectedBookmakers.includes(exchangeMapping[bookmaker])}
                                        onChange={handleExchangeChange}
                                        className="w-4 h-4 rounded border-slate-500 text-purple-500 focus:ring-purple-500/50 bg-slate-600"
                                    />
                                    <span className="text-sm text-slate-300">{bookmaker}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookmakersFilter;
