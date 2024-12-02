import React, { useState } from 'react';

// Defaul rating 
const DEFAULT_ODDS_RANGE = { min: 1.01, max: 1000 };

const OddsRangeFilter = ({
    oddsRange, 
    setOddsRange
}) => {

    const [localOddsRange, setLocalOddsRange] = useState(oddsRange);

    const handleRangeChange = (e) => {
        const { name, value } = e.target;
        const newRange = {
            ...localOddsRange,
            [name]: parseFloat(value)
        };
        setLocalOddsRange(newRange);

        // Aggiorna immediatamente per gli slider
        if (e.target.type === 'range') {
            setOddsRange(newRange);
        }
    };

    // handleBlur solo per gli input numerici
    const handleBlur = (e) => {
        if (e.target.type === 'number') {
            setOddsRange(localOddsRange);
        }
    };

    const resetOddsRange = () => {
        const defaultRange = {
            min: DEFAULT_ODDS_RANGE.min,
            max: DEFAULT_ODDS_RANGE.max
        };
        setLocalOddsRange(defaultRange);
        setOddsRange(defaultRange);
    };

    return (
        <div className="w-full">
            <h3 className="text-sm text-slate-400 mb-2">Filter by Odds Range</h3>
            <div className="space-y-4">
                {/* Slider Quota Minima */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                        Minimum Odds: <span className="text-pink-400">{localOddsRange.min}</span>
                    </label>
                    <input
                        type="range"
                        name="min"
                        min={DEFAULT_ODDS_RANGE.min}
                        max={10}
                        step="0.01"
                        value={localOddsRange.min}
                        onChange={handleRangeChange}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-purple-500
                   [&::-webkit-slider-thumb]:hover:bg-purple-400
                   [&::-moz-range-thumb]:w-4
                   [&::-moz-range-thumb]:h-4
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-purple-500
                   [&::-moz-range-thumb]:hover:bg-purple-400
                   [&::-moz-range-thumb]:border-0
                   focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                </div>

                {/* Slider Quota Massima */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                        Maximum Odds: <span className="text-pink-400">{localOddsRange.max}</span>
                    </label>
                    <input
                        type="range"
                        name="max"
                        min={localOddsRange.min}
                        max={20}
                        step="0.01"
                        value={Math.min(localOddsRange.max, 20)}
                        onChange={handleRangeChange}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-purple-500
                   [&::-webkit-slider-thumb]:hover:bg-purple-400
                   [&::-moz-range-thumb]:w-4
                   [&::-moz-range-thumb]:h-4
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-purple-500
                   [&::-moz-range-thumb]:hover:bg-purple-400
                   [&::-moz-range-thumb]:border-0
                   focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                </div>

                {/* Input numerici */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Min:</label>
                        <input
                            type="number"
                            name="min"
                            value={localOddsRange.min}
                            onChange={handleRangeChange}
                            onBlur={handleBlur}
                            min={DEFAULT_ODDS_RANGE.min}
                            max={localOddsRange.max}
                            step="0.01"
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     placeholder-slate-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Max:</label>
                        <input
                            type="number"
                            name="max"
                            value={localOddsRange.max}
                            onChange={handleRangeChange}
                            onBlur={handleBlur}
                            min={localOddsRange.min}
                            max={DEFAULT_ODDS_RANGE.max}
                            step="0.01"
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     placeholder-slate-400"
                        />
                    </div>
                </div>

                {/* Pulsante Reset */}
                <button
                    onClick={resetOddsRange}
                    className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 
                 rounded-lg transition-colors duration-200 
                 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    Reset Odds Range
                </button>
            </div>
        </div>
    );
};

export default OddsRangeFilter;