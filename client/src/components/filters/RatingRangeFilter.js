import React from 'react';
import { Star, X } from 'lucide-react';

const RatingRangeFilter = ({ 
    ratingRange, 
    setRatingRange 
}) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setRatingRange(prev => ({
            ...prev,
            [name]: Number(value)
        }));
    };

    const clearRating = () => {
        setRatingRange({
            min: 0,
            max: 200
        });
    };

    const isRatingValid = () => {
        return ratingRange.min <= ratingRange.max;
    };

    return (
        <div className="w-full bg-secondary-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-primary-500" />
                    <h3 className="text-sm font-medium text-secondary-200">Rating Range</h3>
                </div>
                {(ratingRange.min !== 0 || ratingRange.max !== 200) && (
                    <button
                        onClick={clearRating}
                        className="p-1 hover:bg-secondary-700 rounded-full transition-colors"
                        title="Reset rating range"
                    >
                        <X className="w-4 h-4 text-secondary-400" />
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="minRating"
                            className="block text-xs font-medium text-secondary-400 uppercase tracking-wider"
                        >
                            Min Rating
                        </label>
                        <input
                            type="number"
                            id="minRating"
                            name="min"
                            value={ratingRange.min}
                            min="0"
                            max="200"
                            onChange={handleChange}
                            className="w-full bg-secondary-900 border border-secondary-700 rounded-lg px-3 py-2 text-secondary-100 
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                            placeholder-secondary-500 text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="maxRating"
                            className="block text-xs font-medium text-secondary-400 uppercase tracking-wider"
                        >
                            Max Rating
                        </label>
                        <input
                            type="number"
                            id="maxRating"
                            name="max"
                            value={ratingRange.max}
                            min="0"
                            max="200"
                            onChange={handleChange}
                            className="w-full bg-secondary-900 border border-secondary-700 rounded-lg px-3 py-2 text-secondary-100 
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                            placeholder-secondary-500 text-sm"
                        />
                    </div>
                </div>

                {!isRatingValid() && (
                    <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        <span>Maximum rating must be greater than minimum rating</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RatingRangeFilter;