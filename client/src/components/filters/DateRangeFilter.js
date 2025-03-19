import React from 'react';
import { Calendar, X } from 'lucide-react';

const DateRangeFilter = ({ 
    dateRange,  
    setDateRange 
}) => {
    const today = new Date().toISOString().split('T')[0];

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearDates = () => {
        setDateRange({
            startDate: '',
            endDate: ''
        });
    };

    const isDateRangeValid = () => {
        if (!dateRange.startDate || !dateRange.endDate) return true;
        return new Date(dateRange.startDate) <= new Date(dateRange.endDate);
    };

    return (
        <div className="w-full bg-secondary-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    <h3 className="text-sm font-medium text-secondary-200">Date Range</h3>
                </div>
                {(dateRange.startDate || dateRange.endDate) && (
                    <button
                        onClick={clearDates}
                        className="p-1 hover:bg-secondary-700 rounded-full transition-colors"
                        title="Clear dates"
                    >
                        <X className="w-4 h-4 text-secondary-400" />
                    </button>
                )}
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="startDate"
                            className="block text-xs font-medium text-secondary-400 uppercase tracking-wider"
                        >
                            From
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={dateRange.startDate}
                            min={today}
                            max={dateRange.endDate || undefined}
                            onChange={handleDateChange}
                            className="w-full bg-secondary-900 border border-secondary-700 rounded-lg px-3 py-2 text-secondary-100 
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                            placeholder-secondary-500 text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="endDate"
                            className="block text-xs font-medium text-secondary-400 uppercase tracking-wider"
                        >
                            To
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={dateRange.endDate}
                            min={dateRange.startDate || today}
                            onChange={handleDateChange}
                            className="w-full bg-secondary-900 border border-secondary-700 rounded-lg px-3 py-2 text-secondary-100 
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                            placeholder-secondary-500 text-sm"
                        />
                    </div>
                </div>

                {!isDateRangeValid() && (
                    <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        <span>End date must be after start date</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DateRangeFilter;