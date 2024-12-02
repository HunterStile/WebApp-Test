import React, { useState } from 'react';

// Defaul rating 
const DEFAULT_RATING_RANGE = { min: 0, max: 200 };

const RatingRangeFilter = ({
    ratingRange, 
    setRatingRange
}) => {

    
    const [localRatingRange, setLocalRatingRange] = useState(ratingRange);

    const handleRangeChange = (e) => {
        const { name, value } = e.target;
        const newRange = {
            ...localRatingRange,
            [name]: parseFloat(value)
        };
        setLocalRatingRange(newRange);

        // Aggiorna immediatamente per gli slider
        if (e.target.type === 'range') {
            setRatingRange(newRange);
        }
    };

    // handleBlur solo per gli input numerici
    const handleBlur = (e) => {
        if (e.target.type === 'number') {
            setRatingRange(localRatingRange);
        }
    };

    const resetRatingRange = () => {
        const defaultRange = {
            min: DEFAULT_RATING_RANGE.min,
            max: DEFAULT_RATING_RANGE.max
        };
        setLocalRatingRange(defaultRange);
        setRatingRange(defaultRange);
    };

    return (
        <div className="w-full">
            <h3 className="text-sm text-slate-400 mb-2">Filter by Rating Range</h3>
            <div className="space-y-4">
                {/* Slider per il minimo */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                        Minimum Rating: <span className="text-cyan-400">{localRatingRange.min}%</span>
                    </label>
                    <input
                        type="range"
                        name="min"
                        min={DEFAULT_RATING_RANGE.min}
                        max={DEFAULT_RATING_RANGE.max}
                        value={localRatingRange.min}
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
                   [&::-moz-range-thumb]:border-0"
                    />
                </div>

                {/* Slider per il massimo */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                        Maximum Rating: <span className="text-cyan-400">{localRatingRange.max}%</span>
                    </label>
                    <input
                        type="range"
                        name="max"
                        min={DEFAULT_RATING_RANGE.min}
                        max={DEFAULT_RATING_RANGE.max}
                        value={localRatingRange.max}
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
                   [&::-moz-range-thumb]:border-0"
                    />
                </div>

                {/* Input numerici */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Min:</label>
                        <input
                            type="number"
                            name="min"
                            value={localRatingRange.min}
                            onChange={handleRangeChange}
                            onBlur={handleBlur}
                            min={DEFAULT_RATING_RANGE.min}
                            max={localRatingRange.max}
                            step="0.1"
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
                            value={localRatingRange.max}
                            onChange={handleRangeChange}
                            onBlur={handleBlur}
                            min={localRatingRange.min}
                            max={DEFAULT_RATING_RANGE.max}
                            step="0.1"
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     placeholder-slate-400"
                        />
                    </div>
                </div>

                {/* Pulsante Reset */}
                <button
                    onClick={resetRatingRange}
                    className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 
                 rounded-lg transition-colors duration-200 
                 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    Reset Rating Range
                </button>
            </div>
        </div>
    );
};

export default RatingRangeFilter;