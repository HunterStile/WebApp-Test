import React from 'react';
import { Coins, X } from 'lucide-react';

// Defaul rating 
const DEFAULT_ODDS_RANGE = { min: 1.01, max: 1000 };

const OddsRangeFilter = ({
    oddsRange, 
    setOddsRange
}) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setOddsRange(prev => ({
            ...prev,
            [name]: Number(value)
        }));
    };

    const clearOdds = () => {
        setOddsRange({
            min: 1.01,
            max: 1000
        });
    };

    const isOddsValid = () => {
        return oddsRange.min <= oddsRange.max && oddsRange.min >= 1.01;
    };

    return (
        <div className="w-full bg-secondary-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Coins className="w-5 h-5 text-primary-500" />
                    <h3 className="text-sm font-medium text-secondary-200">Odds Range</h3>
                </div>
                {(oddsRange.min !== 1.01 || oddsRange.max !== 1000) && (
                    <button
                        onClick={clearOdds}
                        className="p-1 hover:bg-secondary-700 rounded-full transition-colors"
                        title="Reset odds range"
                    >
                        <X className="w-4 h-4 text-secondary-400" />
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="minOdds"
                            className="block text-xs font-medium text-secondary-400 uppercase tracking-wider"
                        >
                            Min Odds
                        </label>
                        <input
                            type="number"
                            id="minOdds"
                            name="min"
                            value={oddsRange.min}
                            min="1.01"
                            step="0.01"
                            onChange={handleChange}
                            className="w-full bg-secondary-900 border border-secondary-700 rounded-lg px-3 py-2 text-secondary-100 
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                            placeholder-secondary-500 text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="maxOdds"
                            className="block text-xs font-medium text-secondary-400 uppercase tracking-wider"
                        >
                            Max Odds
                        </label>
                        <input
                            type="number"
                            id="maxOdds"
                            name="max"
                            value={oddsRange.max}
                            min="1.01"
                            step="0.01"
                            onChange={handleChange}
                            className="w-full bg-secondary-900 border border-secondary-700 rounded-lg px-3 py-2 text-secondary-100 
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                            placeholder-secondary-500 text-sm"
                        />
                    </div>
                </div>

                {!isOddsValid() && (
                    <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        <span>Maximum odds must be greater than minimum odds (min: 1.01)</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OddsRangeFilter;